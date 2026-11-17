from django.test import TestCase
from rest_framework.test import APIClient

class ProductCatalogTests(TestCase):
    def setUp(self):
        self.client = APIClient()

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
