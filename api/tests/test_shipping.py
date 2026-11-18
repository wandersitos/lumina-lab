from django.test import TestCase
from rest_framework.test import APIClient

class ShippingQuoteTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_r1_shipping_quote_valid_city(self):
        """R1 (Portante): POST /api/shipping/quote/ con ciudad válida retorna 200 con transportadora y costo en COP."""
        payload = {
            "city": "Medellin",
            "department": "Antioquia",
            "items_count": 2
        }
        response = self.client.post('/api/shipping/quote/', payload, format='json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get('city'), 'Medellin')
        self.assertIn('carrier', data)
        self.assertIn('cost', data)
        self.assertGreater(data.get('cost', 0), 0)
        self.assertIn('estimated_days', data)
        self.assertEqual(data.get('currency'), 'COP')

    def test_r2_shipping_quote_invalid_or_missing_city(self):
        """R2: POST /api/shipping/quote/ sin ciudad o con datos inválidos retorna 400 Bad Request."""
        # 1. Payload vacío
        response_empty = self.client.post('/api/shipping/quote/', {}, format='json')
        self.assertEqual(response_empty.status_code, 400)
        self.assertIn('error', response_empty.json())

        # 2. Ciudad en blanco
        response_blank = self.client.post('/api/shipping/quote/', {"city": "   "}, format='json')
        self.assertEqual(response_blank.status_code, 400)
        self.assertIn('error', response_blank.json())
