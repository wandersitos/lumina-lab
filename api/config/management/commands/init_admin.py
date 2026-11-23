import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    """Create the initial superuser idempotently from environment variables."""

    help = "Create a superuser from DJANGO_SUPERUSER_* environment variables if it does not already exist."

    def add_arguments(self, parser):
        parser.add_argument(
            "--skip-if-missing",
            action="store_true",
            help="Skip execution instead of raising CommandError when env vars are missing.",
        )

    def handle(self, *args, **options):
        required_vars = (
            "DJANGO_SUPERUSER_USERNAME",
            "DJANGO_SUPERUSER_EMAIL",
            "DJANGO_SUPERUSER_PASSWORD",
        )
        values = {name: os.environ.get(name, "").strip() for name in required_vars}
        missing = [name for name, val in values.items() if not val]
        if missing:
            if options.get("skip_if_missing"):
                self.stdout.write(self.style.WARNING(
                    f"Skipping init_admin: missing environment variables: {', '.join(missing)}"
                ))
                return
            raise CommandError(
                f"Missing required environment variables: {', '.join(missing)}"
            )

        username = values["DJANGO_SUPERUSER_USERNAME"]
        email = values["DJANGO_SUPERUSER_EMAIL"]
        password = values["DJANGO_SUPERUSER_PASSWORD"]

        User = get_user_model()
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.SUCCESS(f"Superuser '{username}' already exists."))
            return

        User.objects.create_superuser(username=username, email=email, password=password)
        self.stdout.write(self.style.SUCCESS(f"Superuser '{username}' created successfully."))
