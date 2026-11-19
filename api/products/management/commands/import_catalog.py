from django.core.management.base import BaseCommand
from products.importer import CatalogImporter


class Command(BaseCommand):
    help = 'Importa productos al catálogo desde archivos .json, .csv o .xlsx'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Ruta al archivo a importar')

    def handle(self, *args, **options):
        file_path = options['file_path']
        self.stdout.write(f"Iniciando importación desde: {file_path}")

        importer = CatalogImporter()
        result = importer.import_file(file_path)

        self.stdout.write(self.style.SUCCESS(
            f"Resultado de la importación:\n"
            f"  Total procesados: {result['total']}\n"
            f"  Creados: {result['created']}\n"
            f"  Actualizados: {result['updated']}\n"
            f"  Errores: {len(result['errors'])}"
        ))

        if result['errors']:
            self.stdout.write(self.style.WARNING("Detalle de errores:"))
            for err in result['errors']:
                self.stdout.write(self.style.ERROR(f"  - {err}"))
