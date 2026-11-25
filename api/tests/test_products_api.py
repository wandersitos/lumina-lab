from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase
from django.core.management import call_command
from rest_framework.test import APIClient
from products.models import Content, Product

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
        """R1: Comando seed_lumina_catalog puebla las 20 lámparas Leora Lumina Lab."""
        call_command('seed_lumina_catalog')
        total = Product.objects.filter(is_active=True).count()
        # Debe haber 20 lámparas oficiales Leora (más la lámpara creada en setUp)
        leora_seeded = Product.objects.filter(collection='leora').exclude(slug='lampara-leora-test').count()
        self.assertEqual(leora_seeded, 20)
        self.assertGreaterEqual(total, 20)


class RefreshCacheAuthTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        User = get_user_model()
        self.regular_user = User.objects.create_user(
            username='regular_user',
            password='password123',
            is_staff=False,
        )
        self.admin_user = User.objects.create_user(
            username='admin_user',
            password='password123',
            is_staff=True,
        )
        self.product = Product.objects.create(
            name="Lámpara Caché Test",
            slug="lampara-cache-test",
            description="Descripción inicial",
            price=250000,
            collection="leora",
            category="Sculpted",
            in_stock=True,
            images=["/img/cache1.jpg"],
            order=1,
            is_active=True,
        )
        self.content = Content.objects.create(
            key="whatsapp_number",
            value="+573000000001",
        )

    def tearDown(self):
        cache.clear()

    def test_r1_anonymous_and_non_staff_rejected_on_refresh(self):
        """R1: Anónimo y no-staff reciben 403 con ?refresh=true y no saltan ni invalidan la caché."""
        # Poblar caché con peticiones públicas iniciales
        self.assertEqual(self.client.get('/api/products/').status_code, 200)
        self.assertEqual(self.client.get(f'/api/products/{self.product.slug}/').status_code, 200)
        self.assertEqual(self.client.get('/api/content/').status_code, 200)

        # Modificar BD directamente sin invalidar caché
        Product.objects.filter(pk=self.product.pk).update(name="Nombre Actualizado BD")
        Content.objects.filter(pk=self.content.pk).update(value="+573009999999")

        endpoints = [
            '/api/products/?refresh=true',
            f'/api/products/{self.product.slug}/?refresh=true',
            '/api/content/?refresh=true',
        ]

        # Anónimo recibe 403
        self.client.force_authenticate(user=None)
        for url in endpoints:
            resp = self.client.get(url)
            self.assertEqual(resp.status_code, 403, f"Anónimo debía recibir 403 en {url}")

        # Usuario normal (is_staff=False) recibe 403
        self.client.force_authenticate(user=self.regular_user)
        for url in endpoints:
            resp = self.client.get(url)
            self.assertEqual(resp.status_code, 403, f"No-staff debía recibir 403 en {url}")

        # Verificar que la caché sigue intacta (devuelve valores originales)
        self.client.force_authenticate(user=None)
        list_data = self.client.get('/api/products/').json()
        self.assertEqual(list_data[0]['name'], "Lámpara Caché Test")
        detail_data = self.client.get(f'/api/products/{self.product.slug}/').json()
        self.assertEqual(detail_data['name'], "Lámpara Caché Test")
        content_data = self.client.get('/api/content/').json()
        self.assertEqual(content_data['whatsapp_number'], "+573000000001")

    def test_r2_admin_can_refresh_and_gets_fresh_data(self):
        """R2: Admin autenticado (is_staff=True) recibe 200 con ?refresh=true/1/yes y obtiene datos frescos."""
        # Poblar caché inicial
        self.assertEqual(self.client.get('/api/products/').status_code, 200)
        self.assertEqual(self.client.get(f'/api/products/{self.product.slug}/').status_code, 200)
        self.assertEqual(self.client.get('/api/content/').status_code, 200)

        # Actualizar BD
        Product.objects.filter(pk=self.product.pk).update(name="Nombre Refrescado Admin")
        Content.objects.filter(pk=self.content.pk).update(value="+573008888888")

        self.client.force_authenticate(user=self.admin_user)

        resp_list = self.client.get('/api/products/?refresh=true')
        self.assertEqual(resp_list.status_code, 200)
        self.assertEqual(resp_list.json()[0]['name'], "Nombre Refrescado Admin")

        resp_detail = self.client.get(f'/api/products/{self.product.slug}/?refresh=1')
        self.assertEqual(resp_detail.status_code, 200)
        self.assertEqual(resp_detail.json()['name'], "Nombre Refrescado Admin")

        resp_content = self.client.get('/api/content/?refresh=yes')
        self.assertEqual(resp_content.status_code, 200)
        self.assertEqual(resp_content.json()['whatsapp_number'], "+573008888888")

    def test_r3_clear_catalog_cache_requires_admin(self):
        """R3: GET y POST a /api/products/cache/clear/ devuelven 403 para anónimo/no-staff y 200 para admin."""
        url = '/api/products/cache/clear/'

        # Anónimo -> 403
        self.client.force_authenticate(user=None)
        self.assertEqual(self.client.get(url).status_code, 403)
        self.assertEqual(self.client.post(url).status_code, 403)

        # No-staff -> 403
        self.client.force_authenticate(user=self.regular_user)
        self.assertEqual(self.client.get(url).status_code, 403)
        self.assertEqual(self.client.post(url).status_code, 403)

        # Admin -> 200 en GET y POST
        self.client.force_authenticate(user=self.admin_user)
        self.assertEqual(self.client.get(url).status_code, 200)
        self.assertEqual(self.client.post(url).status_code, 200)

    def test_r4_public_endpoints_without_refresh_return_200(self):
        """R4: Peticiones sin ?refresh siguen devolviendo 200 para usuarios anónimos."""
        self.client.force_authenticate(user=None)
        self.assertEqual(self.client.get('/api/products/').status_code, 200)
        self.assertEqual(self.client.get(f'/api/products/{self.product.slug}/').status_code, 200)
        self.assertEqual(self.client.get('/api/content/').status_code, 200)
