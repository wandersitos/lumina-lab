from django.test import TestCase
from django.core.management import call_command
from rest_framework.test import APIClient
from products.models import Product

class ProductsApiIntegrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Crear datos de prueba específicos
        self.p_leora = Product.objects.create(
            name="Lámpara Leora Test",
            slug="lampara-leora-test",
            description="Lámpara escultórica de prueba",
            price=350000,
            collection="leora",
            category="Sculpted",
            in_stock=True,
            images=["/img/leora1.jpg", "/img/leora2.jpg"],
            order=1,
            material="Filamento PLA Biodegradable",
            dimensions="30 x 20 cm",
            colors=["Blanco Cálido", "Terracota"],
            is_active=True
        )
        self.p_kumo_base = Product.objects.create(
            name="Base Kumo Test",
            slug="base-kumo-test",
            description="Base arquitectónica Kumo",
            price=180000,
            collection="kumo",
            category="Bases",
            in_stock=True,
            images=["/img/base1.jpg"],
            order=2,
            material="Cerámica / PLA",
            dimensions="15 x 15 cm",
            colors=["Arena", "Grafito"],
            is_active=True
        )
        self.p_kumo_shade = Product.objects.create(
            name="Pantalla Kumo Test",
            slug="pantalla-kumo-test",
            description="Pantalla geométrica Kumo",
            price=120000,
            collection="kumo",
            category="Lampshades",
            in_stock=False,
            images=["/img/shade1.jpg"],
            order=3,
            material="Papel japonés / PLA",
            dimensions="20 x 20 cm",
            colors=["Marfil"],
            is_active=True
        )

    def test_r1_serializer_includes_all_lumina_fields(self):
        """R1: Serializer y GET /api/products/ incluye collection, category, in_stock, images, order, material."""
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreaterEqual(len(data), 3)

        # Buscar el producto Leora creado
        item = next((p for p in data if p['slug'] == 'lampara-leora-test'), None)
        self.assertIsNotNone(item, "El producto Leora debe estar en la respuesta")
        self.assertEqual(item['collection'], 'leora')
        self.assertEqual(item['category'], 'Sculpted')
        self.assertEqual(item['in_stock'], True)
        self.assertEqual(item['images'], ["/img/leora1.jpg", "/img/leora2.jpg"])
        self.assertEqual(item['order'], 1)
        self.assertEqual(item['material'], "Filamento PLA Biodegradable")
        self.assertEqual(item['dimensions'], "30 x 20 cm")
        self.assertEqual(item['colors'], ["Blanco Cálido", "Terracota"])

    def test_r2_filter_by_collection(self):
        """R2: Filtrado por collection retorna únicamente los productos correspondientes."""
        response = self.client.get('/api/products/?collection=kumo')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(len(data) >= 2)
        for item in data:
            self.assertEqual(item['collection'].lower(), 'kumo')

    def test_r2_filter_by_category(self):
        """R2: Filtrado por category retorna únicamente los productos de dicha categoría."""
        response = self.client.get('/api/products/?category=Bases')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(len(data) >= 1)
        for item in data:
            self.assertEqual(item['category'], 'Bases')

    def test_r2_filter_by_in_stock(self):
        """R2: Filtrado por in_stock booleano."""
        response = self.client.get('/api/products/?in_stock=true')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        for item in data:
            self.assertTrue(item['in_stock'])

        response_false = self.client.get('/api/products/?in_stock=false')
        self.assertEqual(response_false.status_code, 200)
        data_false = response_false.json()
        for item in data_false:
            self.assertFalse(item['in_stock'])

    def test_r1_seed_lumina_catalog_command(self):
        """R1: Comando seed_lumina_catalog puebla los 35 productos Lumina Lab."""
        call_command('seed_lumina_catalog')
        total = Product.objects.filter(is_active=True).count()
        # Debe haber al menos 35 productos Lumina
        self.assertGreaterEqual(total, 35)
        kumo_count = Product.objects.filter(collection='kumo').count()
        leora_count = Product.objects.filter(collection='leora').count()
        self.assertGreaterEqual(kumo_count, 20)
        self.assertGreaterEqual(leora_count, 12)
