import io
import json
import csv
import tempfile
import openpyxl
from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from django.core.management import call_command
from django.core.files.uploadedfile import SimpleUploadedFile
from products.models import Product
from products.importer import CatalogImporter


class CatalogImporterTestCase(TestCase):
    def setUp(self):
        self.importer = CatalogImporter()

    def test_r1_import_json(self):
        """R1: CatalogImporter processes JSON list of products."""
        initial_count = Product.objects.count()
        data = [
            {
                "name": "Lámpara Luna Galaxia",
                "slug": "lampara-luna-galaxia",
                "price": 95000,
                "description": "Lámpara con textura lunar detallada",
                "dimensions": "15x15 cm",
                "colors": ["Blanco Cálido", "RGB"],
                "images": ["https://ejemplo.com/luna1.jpg"],
                "is_active": True
            },
            {
                "name": "Lámpara Saturno Minimal",
                "price": 110000,
                "description": "Lámpara con anillo orbital",
                "dimensions": "20x18 cm",
                "colors": ["Ámbar", "Blanco Frío"],
                "images": ["https://ejemplo.com/saturno.jpg"],
            }
        ]
        with tempfile.NamedTemporaryFile(suffix='.json', mode='w+', delete=False, encoding='utf-8') as f:
            json.dump(data, f)
            filepath = f.name

        result = self.importer.import_file(filepath)
        self.assertEqual(result['created'], 2)
        self.assertEqual(result['updated'], 0)
        self.assertEqual(len(result['errors']), 0)
        self.assertEqual(Product.objects.count(), initial_count + 2)

        p1 = Product.objects.get(slug='lampara-luna-galaxia')
        self.assertEqual(p1.name, "Lámpara Luna Galaxia")
        self.assertEqual(int(p1.price), 95000)
        self.assertEqual(p1.dimensions, "15x15 cm")
        self.assertEqual(p1.colors, ["Blanco Cálido", "RGB"])
        self.assertEqual(p1.image_url, "https://ejemplo.com/luna1.jpg")

        # Test auto-generated slug
        p2 = Product.objects.get(slug='lampara-saturno-minimal')
        self.assertEqual(p2.name, "Lámpara Saturno Minimal")
        self.assertEqual(int(p2.price), 110000)

        # Test updating existing product
        data_update = [
            {
                "name": "Lámpara Luna Galaxia Nueva Versión",
                "slug": "lampara-luna-galaxia",
                "price": 99000,
            }
        ]
        with tempfile.NamedTemporaryFile(suffix='.json', mode='w+', delete=False, encoding='utf-8') as f:
            json.dump(data_update, f)
            filepath_update = f.name

        result_update = self.importer.import_file(filepath_update)
        self.assertEqual(result_update['created'], 0)
        self.assertEqual(result_update['updated'], 1)
        p1.refresh_from_db()
        self.assertEqual(p1.name, "Lámpara Luna Galaxia Nueva Versión")
        self.assertEqual(int(p1.price), 99000)

    def test_r1_import_csv(self):
        """R1: CatalogImporter processes CSV files."""
        with tempfile.NamedTemporaryFile(suffix='.csv', mode='w+', delete=False, encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['name', 'slug', 'price', 'description', 'dimensions', 'colors', 'images', 'is_active'])
            writer.writerow(['Lámpara Prisma 3D', 'lampara-prisma-3d', '85000', 'Geometría moderna', '18x12 cm', 'Rojo, Azul, Verde', 'https://ejemplo.com/prisma.jpg', 'true'])
            filepath = f.name

        result = self.importer.import_file(filepath)
        self.assertEqual(result['created'], 1)
        self.assertEqual(result['updated'], 0)
        p = Product.objects.get(slug='lampara-prisma-3d')
        self.assertEqual(p.name, 'Lámpara Prisma 3D')
        self.assertEqual(int(p.price), 85000)
        self.assertEqual(p.colors, ['Rojo', 'Azul', 'Verde'])
        self.assertEqual(p.image_url, 'https://ejemplo.com/prisma.jpg')
        self.assertTrue(p.is_active)

    def test_r1_import_xlsx(self):
        """R1: CatalogImporter processes Excel (.xlsx) files."""
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Productos"
        ws.append(['name', 'slug', 'price', 'description', 'dimensions', 'colors', 'images', 'is_active'])
        ws.append(['Lámpara Aurora Borealis', 'lampara-aurora-borealis', 135000, 'Efecto de luces onduladas', '25x15 cm', 'Multicolor, Verde', 'https://ejemplo.com/aurora.jpg', True])
        
        f = tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False)
        filepath = f.name
        f.close()
        wb.save(filepath)

        result = self.importer.import_file(filepath)
        self.assertEqual(result['errors'], [])
        self.assertEqual(result['created'], 1)
        self.assertEqual(result['updated'], 0)
        p = Product.objects.get(slug='lampara-aurora-borealis')
        self.assertEqual(p.name, 'Lámpara Aurora Borealis')
        self.assertEqual(int(p.price), 135000)
        self.assertEqual(p.colors, ['Multicolor', 'Verde'])

    def test_r1_management_command(self):
        """R1: Management command import_catalog works from CLI."""
        data = [
            {"name": "Lámpara Solar", "slug": "lampara-solar", "price": 75000}
        ]
        with tempfile.NamedTemporaryFile(suffix='.json', mode='w+', delete=False, encoding='utf-8') as f:
            json.dump(data, f)
            filepath = f.name

        out = io.StringIO()
        call_command('import_catalog', filepath, stdout=out)
        output_str = out.getvalue()
        self.assertIn("1", output_str)
        self.assertTrue(Product.objects.filter(slug='lampara-solar').exists())

    def test_r2_admin_view_permissions_and_render(self):
        """R2: Admin import view protected and accessible for staff."""
        client = Client()
        import_url = reverse('admin:products_product_import')
        changelist_url = reverse('admin:products_product_changelist')

        # Anonymous redirect
        resp_anon = client.get(import_url)
        self.assertEqual(resp_anon.status_code, 302)

        # Staff user access
        staff = User.objects.create_superuser(
            username='staff_importer',
            email='staff@luminalab.com',
            password='password123'
        )
        client.force_login(staff)
        
        # Check changelist contains link/button to import
        resp_cl = client.get(changelist_url)
        self.assertEqual(resp_cl.status_code, 200)
        self.assertContains(resp_cl, import_url)

        # Check import page renders
        resp_get = client.get(import_url)
        self.assertEqual(resp_get.status_code, 200)
        self.assertContains(resp_get, 'catalog_file')

    def test_r2_admin_view_post_upload(self):
        """R2: Admin import view processes file upload and redirects with flash message."""
        client = Client()
        staff = User.objects.create_superuser(
            username='staff_uploader',
            email='uploader@luminalab.com',
            password='password123'
        )
        client.force_login(staff)
        import_url = reverse('admin:products_product_import')
        changelist_url = reverse('admin:products_product_changelist')

        json_content = json.dumps([
            {"name": "Lámpara Cósmica", "slug": "lampara-cosmica", "price": 120000}
        ]).encode('utf-8')
        uploaded_file = SimpleUploadedFile("catalogo.json", json_content, content_type="application/json")

        resp = client.post(import_url, {'catalog_file': uploaded_file}, follow=True)
        self.assertRedirects(resp, changelist_url)
        self.assertTrue(Product.objects.filter(slug='lampara-cosmica').exists())
        self.assertContains(resp, "importados/actualizados")

    def test_r3_validation_and_errors(self):
        """R3: Error handling for missing required fields or bad prices."""
        data = [
            {"slug": "sin-nombre", "price": 50000},  # Falta name
            {"name": "Precio Invalido", "price": "no-es-precio"},  # Precio no numérico
            {"name": "Producto Valido", "slug": "producto-valido", "price": 45000}  # Válido
        ]
        with tempfile.NamedTemporaryFile(suffix='.json', mode='w+', delete=False, encoding='utf-8') as f:
            json.dump(data, f)
            filepath = f.name

        result = self.importer.import_file(filepath)
        self.assertEqual(result['created'], 1)
        self.assertEqual(result['updated'], 0)
        self.assertEqual(len(result['errors']), 2)
        self.assertEqual(result['total'], 3)
        self.assertTrue(Product.objects.filter(slug='producto-valido').exists())
        self.assertFalse(Product.objects.filter(slug='sin-nombre').exists())

        # Test unsupported extension
        with tempfile.NamedTemporaryFile(suffix='.txt', mode='w+', delete=False) as f:
            f.write("invalido")
            bad_path = f.name
        res_bad = self.importer.import_file(bad_path)
        self.assertTrue(len(res_bad['errors']) > 0)
