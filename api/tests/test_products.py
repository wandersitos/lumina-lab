from django.test import TestCase
from rest_framework.test import APIClient

class ProductCatalogTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        from products.models import Product
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
