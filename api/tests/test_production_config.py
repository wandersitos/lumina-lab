import json
import os
import re
import subprocess
import sys
from pathlib import Path
from unittest.mock import patch

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase


API_DIR = Path(settings.BASE_DIR)
REPO_ROOT = API_DIR.parent
SECURE_TEST_KEY = "prod-test-key-with-more-than-fifty-unique-chars-0123456789abcdef"


def _eval_settings_in_subprocess(env_overrides, expr):
    env = os.environ.copy()
    for key in ("DEBUG", "SECRET_KEY", "ALLOWED_HOSTS", "CORS_ALLOWED_ORIGINS", "SECURE_SSL_REDIRECT"):
        env.pop(key, None)
    env.update(env_overrides)
    return subprocess.run(
        [sys.executable, "-c", expr],
        cwd=str(API_DIR),
        env=env,
        capture_output=True,
        text=True,
    )


class ProductionConfigTests(TestCase):
    def test_r1_fail_closed_debug_and_secret_key_validation(self):
        """R1 (Portante): DEBUG defaults to False and non-DEBUG requires a secure SECRET_KEY."""
        res_missing = _eval_settings_in_subprocess(
            {},
            "import os; os.environ['DJANGO_SETTINGS_MODULE']='config.settings'; import django; django.setup()",
        )
        self.assertNotEqual(res_missing.returncode, 0)
        self.assertIn("ImproperlyConfigured", res_missing.stderr)

        res_insecure = _eval_settings_in_subprocess(
            {"DEBUG": "False", "SECRET_KEY": "django-insecure-local-dev"},
            "import os; os.environ['DJANGO_SETTINGS_MODULE']='config.settings'; import django; django.setup()",
        )
        self.assertNotEqual(res_insecure.returncode, 0)
        self.assertIn("ImproperlyConfigured", res_insecure.stderr)

        res_prod = _eval_settings_in_subprocess(
            {"SECRET_KEY": SECURE_TEST_KEY},
            (
                "import os, json; os.environ['DJANGO_SETTINGS_MODULE']='config.settings'; "
                "import django; django.setup(); from django.conf import settings; "
                "print(json.dumps({"
                "'debug': settings.DEBUG, "
                "'ssl_redirect': settings.SECURE_SSL_REDIRECT, "
                "'session_secure': settings.SESSION_COOKIE_SECURE, "
                "'csrf_secure': settings.CSRF_COOKIE_SECURE, "
                "'hsts': settings.SECURE_HSTS_SECONDS, "
                "'hsts_sub': settings.SECURE_HSTS_INCLUDE_SUBDOMAINS, "
                "'hsts_preload': settings.SECURE_HSTS_PRELOAD"
                "}))"
            ),
        )
        self.assertEqual(res_prod.returncode, 0, res_prod.stderr)
        data = json.loads(res_prod.stdout.strip())
        self.assertFalse(data["debug"])
        self.assertTrue(data["ssl_redirect"])
        self.assertTrue(data["session_secure"])
        self.assertTrue(data["csrf_secure"])
        self.assertEqual(data["hsts"], 31536000)
        self.assertTrue(data["hsts_sub"])
        self.assertTrue(data["hsts_preload"])

    def test_r1_debug_true_keeps_local_mode(self):
        """R1: Explicit DEBUG=True enables local development mode and permissive CORS."""
        res_dev = _eval_settings_in_subprocess(
            {"DEBUG": "True"},
            (
                "import os, json; os.environ['DJANGO_SETTINGS_MODULE']='config.settings'; "
                "import django; django.setup(); from django.conf import settings; "
                "print(json.dumps({'debug': settings.DEBUG, 'cors_all': settings.CORS_ALLOW_ALL_ORIGINS}))"
            ),
        )
        self.assertEqual(res_dev.returncode, 0, res_dev.stderr)
        data = json.loads(res_dev.stdout.strip())
        self.assertTrue(data["debug"])
        self.assertTrue(data["cors_all"])

    def test_r1_allowed_hosts_cors_csrf_and_proxy_header(self):
        """R1: ALLOWED_HOSTS, CORS, CSRF_TRUSTED_ORIGINS, and SECURE_PROXY_SSL_HEADER match production defaults."""
        self.assertNotIn("*", settings.ALLOWED_HOSTS)
        for host in (".luminalab-studio.com", "luminalab-studio.com", ".onrender.com", "localhost", "127.0.0.1"):
            self.assertIn(host, settings.ALLOWED_HOSTS)

        self.assertEqual(settings.SECURE_PROXY_SSL_HEADER, ("HTTP_X_FORWARDED_PROTO", "https"))

        for origin in (
            "https://www.luminalab-studio.com",
            "https://luminalab-studio.com",
            "https://*.onrender.com",
            "https://*.vercel.app",
        ):
            self.assertIn(origin, settings.CSRF_TRUSTED_ORIGINS)

        self.assertFalse(settings.CORS_ALLOW_ALL_ORIGINS)
        self.assertIn("https://www.luminalab-studio.com", settings.CORS_ALLOWED_ORIGINS)
        self.assertIn("https://luminalab-studio.com", settings.CORS_ALLOWED_ORIGINS)
        regexes = getattr(settings, "CORS_ALLOWED_ORIGIN_REGEXES", [])
        self.assertTrue(
            any(re.match(pattern, "https://wonder-store-git-main.vercel.app") for pattern in regexes),
            f"Expected Vercel preview regex in CORS_ALLOWED_ORIGIN_REGEXES, got {regexes}",
        )

    def test_r1_whitenoise_and_requirements(self):
        """R1: WhiteNoise middleware immediately follows SecurityMiddleware and CompressedManifestStaticFilesStorage is configured."""
        middleware = list(settings.MIDDLEWARE)
        self.assertIn("django.middleware.security.SecurityMiddleware", middleware)
        self.assertIn("whitenoise.middleware.WhiteNoiseMiddleware", middleware)
        sec_idx = middleware.index("django.middleware.security.SecurityMiddleware")
        self.assertEqual(middleware[sec_idx + 1], "whitenoise.middleware.WhiteNoiseMiddleware")

        self.assertEqual(settings.STATIC_ROOT, settings.BASE_DIR / "staticfiles")
        res_storage = _eval_settings_in_subprocess(
            {"SECRET_KEY": SECURE_TEST_KEY},
            (
                "import os; os.environ['DJANGO_SETTINGS_MODULE']='config.settings'; "
                "import django; django.setup(); from django.conf import settings; "
                "print(settings.STORAGES['staticfiles']['BACKEND'])"
            ),
        )
        self.assertEqual(res_storage.returncode, 0, res_storage.stderr)
        self.assertEqual(
            res_storage.stdout.strip(),
            "whitenoise.storage.CompressedManifestStaticFilesStorage",
        )

        reqs = (API_DIR / "requirements.txt").read_text(encoding="utf-8")
        self.assertRegex(reqs, r"(?im)^gunicorn>=22\.0\.0")
        self.assertRegex(reqs, r"(?im)^whitenoise>=6\.6\.0")

    def test_r2_dockerfile_production_configuration(self):
        """R2: Production Dockerfile uses python:3.12-slim, gunicorn, non-root user, and collectstatic."""
        dockerfile = (API_DIR / "Dockerfile").read_text(encoding="utf-8")
        self.assertIn("FROM python:3.12-slim", dockerfile)
        self.assertIn("requirements.txt", dockerfile)
        self.assertNotIn("requirements-dev.txt", dockerfile)
        self.assertIn("appuser", dockerfile)
        self.assertIn("USER appuser", dockerfile)
        self.assertIn("collectstatic --noinput", dockerfile)
        self.assertIn("EXPOSE 8000", dockerfile)
        self.assertIn("gunicorn config.wsgi:application", dockerfile)
        self.assertIn("--workers 3", dockerfile)
        self.assertIn("--threads 2", dockerfile)

    def test_r3_vercel_json_spa_rewrites(self):
        """R3: frontend/vercel.json configures SPA fallback rewrite to /index.html."""
        vercel_path = REPO_ROOT / "frontend" / "vercel.json"
        self.assertTrue(vercel_path.exists(), "frontend/vercel.json must exist")
        config = json.loads(vercel_path.read_text(encoding="utf-8"))
        self.assertIn("rewrites", config)
        self.assertIn({"source": "/(.*)", "destination": "/index.html"}, config["rewrites"])

    def test_r4_init_admin_command(self):
        """R4: manage.py init_admin requires env vars and creates superuser idempotently."""
        User = get_user_model()
        with patch.dict(os.environ, {}, clear=False):
            for key in ("DJANGO_SUPERUSER_USERNAME", "DJANGO_SUPERUSER_EMAIL", "DJANGO_SUPERUSER_PASSWORD"):
                os.environ.pop(key, None)
            with self.assertRaisesRegex(CommandError, r"DJANGO_SUPERUSER_"):
                call_command("init_admin")

        env_vars = {
            "DJANGO_SUPERUSER_USERNAME": "lumina_admin",
            "DJANGO_SUPERUSER_EMAIL": "admin@luminalab-studio.com",
            "DJANGO_SUPERUSER_PASSWORD": "StrongProdPassword!2026",
        }
        with patch.dict(os.environ, env_vars, clear=False):
            call_command("init_admin")
            user = User.objects.get(username="lumina_admin")
            self.assertTrue(user.is_superuser)
            self.assertTrue(user.is_staff)
            self.assertEqual(user.email, "admin@luminalab-studio.com")
            self.assertTrue(user.check_password("StrongProdPassword!2026"))

            # Idempotent second invocation
            call_command("init_admin")
            self.assertEqual(User.objects.filter(username="lumina_admin").count(), 1)
