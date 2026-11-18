from django.test import TestCase
from rest_framework.test import APIClient

class OrdersCheckoutTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_r1_create_order_valid_payload(self):
        """R1 (Portante): POST /api/checkout/ con datos válidos crea orden en BD en PENDIENTE y retorna 201 con payment_url."""
        from orders.models import Order

        payload = {
            "customer_name": "Laura Gómez",
            "customer_email": "laura.gomez@example.com",
            "customer_phone": "+57 300 987 6543",
            "shipping_address": "Carrera 43A # 1-50, Poblado",
            "shipping_city": "Medellin",
            "items": [
                {
                    "product_id": 1,
                    "name": "Lámpara Vórtice",
                    "variant": "Blanco Cálido / Nogal",
                    "price": 145000,
                    "quantity": 1
                }
            ],
            "shipping_cost": 13500
        }

        response = self.client.post('/api/checkout/', payload, format='json')
        self.assertEqual(response.status_code, 201)

        data = response.json()
        self.assertIn('order_id', data)
        self.assertIn('order_number', data)
        self.assertTrue(data['order_number'].startswith('LUM-'))
        self.assertEqual(data.get('status'), 'PENDIENTE')
        self.assertEqual(data.get('total_amount'), 158500)
        self.assertIn('payment_url', data)
        self.assertTrue(len(data['payment_url']) > 0)

        # Verificar persistencia en base de datos
        order = Order.objects.get(order_number=data['order_number'])
        self.assertEqual(order.customer_name, "Laura Gómez")
        self.assertEqual(order.customer_email, "laura.gomez@example.com")
        self.assertEqual(order.subtotal, 145000)
        self.assertEqual(order.shipping_cost, 13500)
        self.assertEqual(order.total_amount, 158500)
        self.assertEqual(order.status, "PENDIENTE")
        self.assertEqual(order.shipping_city, "Medellin")
        self.assertEqual(len(order.items_summary), 1)

    def test_r2_create_order_empty_cart_returns_400(self):
        """R2: POST /api/checkout/ con carrito vacío rechaza con HTTP 400 Bad Request."""
        payload = {
            "customer_name": "Laura Gómez",
            "customer_email": "laura.gomez@example.com",
            "customer_phone": "+57 300 987 6543",
            "shipping_address": "Carrera 43A # 1-50",
            "shipping_city": "Medellin",
            "items": [],
            "shipping_cost": 13500
        }

        response = self.client.post('/api/checkout/', payload, format='json')
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn('error', data)

    def test_r2_create_order_missing_fields_returns_400(self):
        """R2: POST /api/checkout/ sin campos requeridos retorna HTTP 400 Bad Request."""
        incomplete_payload = {
            "customer_name": "Laura Gómez",
            # falta email, phone, address, city
            "items": [{"name": "Lámpara", "price": 100000, "quantity": 1}]
        }

        response = self.client.post('/api/checkout/', incomplete_payload, format='json')
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn('error', data)

    def test_wompi_adapter_hexagonal(self):
        """Verifica la arquitectura hexagonal de pagos y el adaptador Wompi mock/sandbox."""
        from orders.adapters import PaymentGatewayPort, WompiPaymentAdapter, PaymentService

        class DummyOrder:
            def __init__(self, order_number, total_amount):
                self.order_number = order_number
                self.total_amount = total_amount

        adapter = WompiPaymentAdapter()
        self.assertIsInstance(adapter, PaymentGatewayPort)

        order = DummyOrder("LUM-20261118-TEST", 158500)
        checkout_info = adapter.create_checkout(order)

        self.assertIn("payment_url", checkout_info)
        self.assertIn("provider", checkout_info)
        self.assertEqual(checkout_info["provider"], "wompi")
        self.assertIn("LUM-20261118-TEST", checkout_info["payment_url"])

        # Servicio con inyección de adaptador
        service = PaymentService(gateway=adapter)
        service_result = service.generate_checkout(order)
        self.assertEqual(service_result["payment_url"], checkout_info["payment_url"])
