from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase
from rest_framework.test import APIClient
from products.models import Product, Content
from products.views import CATALOG_CACHE_TIMEOUT


class ProductCatalogTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.product = Product.objects.create(
            name='Lámpara Vórtice',
            slug='lampara-vortice',
            description='Diseño helicoidal orgánico con entramado geométrico que difumina la luz suavemente.',
            price=120000,
            dimensions='24 x 16 cm',
            image_url='https://images.unsplash.com/photo-1507473885765-e6ed057f782c',
            colors=['Blanco Cálido', 'Terracota', 'Verde Salvia'],
            is_active=True
        )

    def tearDown(self):
        cache.clear()

    def test_r1_list_active_products(self):
        """R1: GET /api/products/ retorna lista JSON con productos activos."""
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 1)
        item = data[0]
        self.assertIn('id', item)
        self.assertIn('name', item)
        self.assertIn('slug', item)
        self.assertIn('description', item)
        self.assertIn('price', item)
        self.assertIn('dimensions', item)
        self.assertIn('image_url', item)
        self.assertIn('colors', item)
        self.assertIsInstance(item['colors'], list)

    def test_r2_product_detail_and_404(self):
        """R2: GET /api/products/<slug>/ retorna 200 para producto existente y 404 para inexistente."""
        # Primero probamos con un slug existente
        response = self.client.get('/api/products/lampara-vortice/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get('slug'), 'lampara-vortice')
        self.assertEqual(data.get('name'), 'Lámpara Vórtice')
        self.assertIn('colors', data)

        # Probamos slug inexistente -> 404
        response_404 = self.client.get('/api/products/slug-inexistente/')
        self.assertEqual(response_404.status_code, 404)


class CatalogCacheBackendTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        User = get_user_model()
        self.admin_user = User.objects.create_superuser(
            username='admin_cache_test',
            email='admin_cache@lumina.test',
            password='adminpassword123'
        )
        self.regular_user = User.objects.create_user(
            username='regular_cache_test',
            email='regular_cache@lumina.test',
            password='regularpassword123'
        )
        self.product = Product.objects.create(
            name='Lámpara Vórtice Cache',
            slug='lampara-vortice-cache',
            description='Descripción test',
            price=150000,
            is_active=True
        )
        self.content = Content.objects.create(
            key='whatsapp_number',
            value='+573001112233'
        )

    def tearDown(self):
        cache.clear()

    def test_r1_catalog_cache_timeout_constant_is_three_months(self):
        """R1: CATALOG_CACHE_TIMEOUT debe ser exactamente 7.776.000 segundos (90 días / 3 meses)."""
        expected_timeout = 90 * 24 * 3600  # 7776000
        self.assertEqual(CATALOG_CACHE_TIMEOUT, 7776000)
        self.assertEqual(CATALOG_CACHE_TIMEOUT, expected_timeout)

    def test_r1_cache_set_uses_catalog_cache_timeout_three_months(self):
        """R1: ProductListView, ProductDetailView y ContentListView deben usar CATALOG_CACHE_TIMEOUT al guardar en caché."""
        with patch('products.views.cache.set') as mock_cache_set:
            # 1. ProductListView
            resp_list = self.client.get('/api/products/')
            self.assertEqual(resp_list.status_code, 200)
            mock_cache_set.assert_called_with('lumina_products_list_', resp_list.data, timeout=CATALOG_CACHE_TIMEOUT)

            mock_cache_set.reset_mock()

            # 2. ProductDetailView
            resp_detail = self.client.get(f'/api/products/{self.product.slug}/')
            self.assertEqual(resp_detail.status_code, 200)
            mock_cache_set.assert_called_with(f'lumina_product_detail_{self.product.slug}', resp_detail.data, timeout=CATALOG_CACHE_TIMEOUT)

            mock_cache_set.reset_mock()

            # 3. ContentListView
            resp_content = self.client.get('/api/content/')
            self.assertEqual(resp_content.status_code, 200)
            mock_cache_set.assert_called_with('lumina_site_content_dict', resp_content.data, timeout=CATALOG_CACHE_TIMEOUT)

    def test_r1_cache_persistence_and_subsequent_reads(self):
        """R1: Las lecturas subsiguientes retornan datos cacheados inmediatamente sin tocar la BD."""
        # Primera petición: puebla la caché
        resp1 = self.client.get('/api/products/')
        self.assertEqual(resp1.status_code, 200)
        original_name = resp1.json()[0]['name']

        # Mutar BD directamente
        Product.objects.filter(pk=self.product.pk).update(name='Nombre Modificado Directo BD')

        # Segunda petición sin refresco: debe devolver el dato cacheado original
        resp2 = self.client.get('/api/products/')
        self.assertEqual(resp2.status_code, 200)
        self.assertEqual(resp2.json()[0]['name'], original_name)

    def test_r1_refresh_permission_requires_staff(self):
        """R1: ?refresh=true requiere staff (anónimo/regular da 403, staff da 200 y refresca)."""
        # Poblar caché
        self.client.get('/api/products/')
        Product.objects.filter(pk=self.product.pk).update(name='Nuevo Nombre Post Refresh')

        # Anónimo -> 403
        resp_anon = self.client.get('/api/products/?refresh=true')
        self.assertEqual(resp_anon.status_code, 403)

        # Regular -> 403
        self.client.force_authenticate(user=self.regular_user)
        resp_reg = self.client.get('/api/products/?refresh=true')
        self.assertEqual(resp_reg.status_code, 403)

        # Staff -> 200 y trae dato actualizado
        self.client.force_authenticate(user=self.admin_user)
        resp_staff = self.client.get('/api/products/?refresh=true')
        self.assertEqual(resp_staff.status_code, 200)
        self.assertEqual(resp_staff.json()[0]['name'], 'Nuevo Nombre Post Refresh')

    def test_r1_clear_catalog_cache_endpoint_requires_staff(self):
        """R1: ClearCatalogCacheView (/api/products/cache/clear/) requiere autenticación de administrador."""
        url = '/api/products/cache/clear/'
        # Anónimo -> 403
        resp_anon = self.client.post(url)
        self.assertEqual(resp_anon.status_code, 403)

        # Regular -> 403
        self.client.force_authenticate(user=self.regular_user)
        resp_reg = self.client.post(url)
        self.assertEqual(resp_reg.status_code, 403)

        # Staff -> 200
        self.client.force_authenticate(user=self.admin_user)
        resp_staff = self.client.post(url)
        self.assertEqual(resp_staff.status_code, 200)
