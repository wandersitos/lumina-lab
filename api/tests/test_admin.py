from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.contrib import admin
from django.urls import reverse
from orders.models import Order
from products.models import Product


class AdminPanelTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.admin_user = User.objects.create_superuser(
            username='admin_lumina',
            email='admin@luminalab.com',
            password='securepassword123'
        )
        self.staff_user = User.objects.create_superuser(
            username='staff_lumina',
            email='staff@luminalab.com',
            password='staffpassword123'
        )
        self.product = Product.objects.create(
            name='Lámpara Vórtice 3D',
            slug='lampara-vortice-3d',
            description='Lámpara espiral para escritorio',
            price=125000,
            dimensions='22x14 cm',
            is_active=True
        )
        self.order = Order.objects.create(
            customer_name='Laura Martínez',
            customer_email='laura@example.com',
            customer_phone='3001234567',
            shipping_address='Cra 15 # 85-20',
            shipping_city='Bogotá',
            items_summary=[{'name': 'Lámpara Vórtice 3D', 'quantity': 1, 'price': 125000}],
            subtotal=125000,
            shipping_cost=12000,
            total_amount=137000,
            status='PENDIENTE'
        )

    def test_r1_order_admin_registered_and_accessible(self):
        """R1: OrderAdmin registered with list_display, search and accessible by staff."""
        self.assertIn(Order, admin.site._registry, "Order model must be registered in django admin")
        order_admin = admin.site._registry[Order]
        
        # Verify required list_display columns
        expected_list_display = ('order_number', 'customer_name', 'customer_phone', 'shipping_city', 'total_amount', 'status', 'tracking_number', 'created_at')
        for field in expected_list_display:
            self.assertIn(field, order_admin.list_display, f"{field} should be in OrderAdmin.list_display")

        # Verify search fields
        self.assertIn('order_number', order_admin.search_fields)
        self.assertIn('customer_name', order_admin.search_fields)

        # Verify staff access to changelist
        self.client.force_login(self.staff_user)
        changelist_url = reverse('admin:orders_order_changelist')
        response = self.client.get(changelist_url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, self.order.order_number)
        self.assertContains(response, 'Laura Martínez')

        # Test search query
        search_response = self.client.get(changelist_url, {'q': 'Laura'})
        self.assertEqual(search_response.status_code, 200)
        self.assertContains(search_response, self.order.order_number)

    def test_r1_order_admin_update_status_and_tracking(self):
        """R1: Order detail allows updating status and tracking_number."""
        self.assertTrue(hasattr(self.order, 'tracking_number'), "Order model must have tracking_number attribute")
        self.client.force_login(self.admin_user)
        change_url = reverse('admin:orders_order_change', args=[self.order.pk])
        
        response = self.client.get(change_url)
        self.assertEqual(response.status_code, 200)

        # Update order with new status and tracking number
        post_data = {
            'customer_name': self.order.customer_name,
            'customer_email': self.order.customer_email,
            'customer_phone': self.order.customer_phone,
            'shipping_address': self.order.shipping_address,
            'shipping_city': self.order.shipping_city,
            'subtotal': self.order.subtotal,
            'shipping_cost': self.order.shipping_cost,
            'total_amount': self.order.total_amount,
            'status': 'EN_PREPARACION',
            'tracking_number': 'COOR-99887766',
            'payment_url': self.order.payment_url,
            'items_summary': '[]',
            '_save': 'Guardar',
        }
        post_response = self.client.post(change_url, post_data)
        self.assertIn(post_response.status_code, [302, 200])

        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'EN_PREPARACION')
        self.assertEqual(self.order.tracking_number, 'COOR-99887766')

    def test_r2_product_admin_registered_and_accessible(self):
        """R2: ProductAdmin registered and accessible for catalog management."""
        self.assertIn(Product, admin.site._registry, "Product model must be registered in django admin")
        product_admin = admin.site._registry[Product]
        
        expected_fields = ('name', 'slug', 'price', 'dimensions', 'is_active', 'created_at')
        for field in expected_fields:
            self.assertIn(field, product_admin.list_display, f"{field} should be in ProductAdmin.list_display")

        self.client.force_login(self.staff_user)
        changelist_url = reverse('admin:products_product_changelist')
        response = self.client.get(changelist_url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Lámpara Vórtice 3D')

    def test_r3_admin_branding_and_security(self):
        """R3: Branding headers present and anonymous access redirected to login."""
        # Anonymous access redirect
        anon_client = Client()
        response = anon_client.get('/admin/')
        self.assertEqual(response.status_code, 302)
        self.assertTrue(response.url.startswith('/admin/login/'))

        # Staff user gets 200 and sees custom branding
        self.client.force_login(self.staff_user)
        admin_home = self.client.get('/admin/')
        self.assertEqual(admin_home.status_code, 200)
        self.assertContains(admin_home, "Lumina Lab — Control de Pedidos e Impresión 3D")
