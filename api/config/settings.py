import os
import sys
from pathlib import Path
from urllib.parse import urlparse
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent

_CMD = sys.argv[1] if len(sys.argv) > 1 and sys.argv[0].endswith('manage.py') else ''
_IS_TEST_RUN = _CMD == 'test' or 'pytest' in sys.modules

DEBUG = os.environ.get('DEBUG', 'False').lower() in ('true', '1', 'yes')

SECRET_KEY = os.environ.get('SECRET_KEY', '')
if not DEBUG:
    if not SECRET_KEY or SECRET_KEY.startswith('django-insecure-'):
        # Allow manage.py test without explicit env vars while keeping runtime fail-closed.
        if _IS_TEST_RUN and 'DEBUG' not in os.environ:
            SECRET_KEY = 'django-insecure-test-key'
        else:
            raise ImproperlyConfigured(
                'SECRET_KEY environment variable must be set to a secure value when DEBUG is False.'
            )
elif not SECRET_KEY:
    SECRET_KEY = 'django-insecure-local-dev-key'

default_allowed_hosts = '.luminalab-studio.com,luminalab-studio.com,.onrender.com,localhost,127.0.0.1'
_env_allowed_hosts = os.environ.get('ALLOWED_HOSTS')
if _env_allowed_hosts:
    ALLOWED_HOSTS = [h.strip() for h in _env_allowed_hosts.split(',') if h.strip()]
    for _fallback_host in ('.onrender.com', 'localhost', '127.0.0.1'):
        if _fallback_host not in ALLOWED_HOSTS:
            ALLOWED_HOSTS.append(_fallback_host)
else:
    ALLOWED_HOSTS = [
        h.strip()
        for h in default_allowed_hosts.split(',')
        if h.strip()
    ]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'config',
    'products',
    'shipping',
    'orders.apps.OrdersConfig',
    'tests',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

database_url = os.environ.get('DATABASE_URL')
if database_url:
    url = urlparse(database_url)
    if url.scheme in ('postgres', 'postgresql'):
        DATABASES['default'] = {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': url.path.lstrip('/'),
            'USER': url.username,
            'PASSWORD': url.password,
            'HOST': url.hostname,
            'PORT': url.port or 5432,
        }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'es-es'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': (
            'whitenoise.storage.CompressedStaticFilesStorage'
            if _IS_TEST_RUN
            else 'whitenoise.storage.CompressedManifestStaticFilesStorage'
        ),
    },
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOW_ALL_ORIGINS = DEBUG
default_cors_origins = (
    'http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173'
    if DEBUG
    else 'https://www.luminalab-studio.com,https://luminalab-studio.com'
)
cors_origins = os.environ.get('CORS_ALLOWED_ORIGINS', default_cors_origins)
CORS_ALLOWED_ORIGINS = [
    origin.strip() for origin in cors_origins.split(',') if origin.strip()
]
if not DEBUG:
    CORS_ALLOWED_ORIGIN_REGEXES = [
        r'^https://.*\.vercel\.app$',
    ]

default_csrf_origins = (
    'https://www.luminalab-studio.com,'
    'https://luminalab-studio.com,'
    'https://*.onrender.com,'
    'https://*.vercel.app'
)
_env_csrf_origins = os.environ.get('CSRF_TRUSTED_ORIGINS')
if _env_csrf_origins:
    CSRF_TRUSTED_ORIGINS = [o.strip() for o in _env_csrf_origins.split(',') if o.strip()]
    for _base_origin in ('https://*.onrender.com', 'https://*.vercel.app'):
        if _base_origin not in CSRF_TRUSTED_ORIGINS:
            CSRF_TRUSTED_ORIGINS.append(_base_origin)
else:
    CSRF_TRUSTED_ORIGINS = [
        origin.strip()
        for origin in default_csrf_origins.split(',')
        if origin.strip()
    ]

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_SSL_REDIRECT = (
        False
        if (_IS_TEST_RUN and 'SECURE_SSL_REDIRECT' not in os.environ)
        else os.environ.get('SECURE_SSL_REDIRECT', 'True').lower() in ('true', '1', 'yes')
    )
    SECURE_HSTS_SECONDS = int(os.environ.get('SECURE_HSTS_SECONDS', 31536000))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
