from django.contrib import admin
from django.core.cache import cache
from django.test import TestCase
from rest_framework.test import APIClient

from products.admin import ProductAdmin
from products.models import (
    Product,
    ProductOption,
    ProductOptionAssignment,
    ProductOptionGroup,
)


class ProductOptionsApiTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.product = Product.objects.create(
            name="Lámpara Test Opciones",
            slug="lampara-test-opciones",
            description="Lámpara de prueba para opciones configurables",
            price=150000,
            collection="leora",
            category="Sculpted",
            in_stock=True,
            is_active=True,
        )
        self.other_product = Product.objects.create(
            name="Lámpara Test Sin Opciones",
            slug="lampara-test-sin-opciones",
            description="Lámpara sin opciones asignadas",
            price=120000,
            collection="kumo",
            category="Mini",
            in_stock=True,
            is_active=True,
        )

        self.conexion_group, _ = ProductOptionGroup.objects.get_or_create(
            slug="conexion",
            defaults={"name": "Conexión", "order": 1, "is_active": True},
        )
        self.opt_inalambrica, _ = ProductOption.objects.get_or_create(
            group=self.conexion_group,
            slug="inalambrica",
            defaults={
                "name": "Inalámbrica",
                "is_visible": True,
                "in_stock": True,
                "price_delta": 0,
                "order": 1,
            },
        )
        self.opt_con_cable, _ = ProductOption.objects.get_or_create(
            group=self.conexion_group,
            slug="con-cable",
            defaults={
                "name": "Con cable",
                "is_visible": True,
                "in_stock": True,
                "price_delta": 0,
                "order": 2,
            },
        )

        self.assign_inalambrica = ProductOptionAssignment.objects.create(
            product=self.product,
            option=self.opt_inalambrica,
            is_visible=True,
            in_stock=True,
        )
        self.assign_con_cable = ProductOptionAssignment.objects.create(
            product=self.product,
            option=self.opt_con_cable,
            is_visible=True,
            in_stock=True,
        )

    def test_r1_seeded_groups_and_api_option_groups_structure(self):
        """R1: Migración siembra Conexión y Tamaño; API devuelve option_groups ordenados en listado y detalle."""
        self.assertTrue(ProductOptionGroup.objects.filter(slug="conexion").exists())
        self.assertTrue(ProductOptionGroup.objects.filter(slug="tamano").exists())
        self.assertTrue(
            ProductOption.objects.filter(group__slug="conexion", slug="inalambrica").exists()
        )
        self.assertTrue(
            ProductOption.objects.filter(group__slug="conexion", slug="con-cable").exists()
        )

        # Detalle
        detail_res = self.client.get(f"/api/products/{self.product.slug}/")
        self.assertEqual(detail_res.status_code, 200)
        detail_data = detail_res.json()
        self.assertIn("option_groups", detail_data)
        self.assertEqual(len(detail_data["option_groups"]), 1)
        group = detail_data["option_groups"][0]
        self.assertEqual(group["name"], "Conexión")
        self.assertEqual([o["name"] for o in group["options"]], ["Inalámbrica", "Con cable"])
        self.assertTrue(all(o["in_stock"] is True for o in group["options"]))
        self.assertEqual([o["price_delta"] for o in group["options"]], [0, 0])

        # Listado
        list_res = self.client.get("/api/products/")
        self.assertEqual(list_res.status_code, 200)
        item = next(p for p in list_res.json() if p["slug"] == self.product.slug)
        self.assertEqual(len(item["option_groups"]), 1)
        self.assertEqual(item["option_groups"][0]["slug"], "conexion")

    def test_r2_out_of_stock_global_and_per_product_keeps_visible_and_invalidates_cache(self):
        """R2: in_stock=False global o por producto mantiene la opción visible con in_stock=False e invalida caché."""
        # Poblar caché primero
        res1 = self.client.get(f"/api/products/{self.product.slug}/")
        self.assertEqual(res1.status_code, 200)
        self.assertTrue(res1.json()["option_groups"][0]["options"][0]["in_stock"])

        # Marcar Inalámbrica agotada globalmente
        self.opt_inalambrica.in_stock = False
        self.opt_inalambrica.save()

        res2 = self.client.get(f"/api/products/{self.product.slug}/")
        self.assertEqual(res2.status_code, 200)
        opts2 = res2.json()["option_groups"][0]["options"]
        self.assertEqual([o["name"] for o in opts2], ["Inalámbrica", "Con cable"])
        self.assertFalse(opts2[0]["in_stock"])
        self.assertTrue(opts2[1]["in_stock"])

        # Restaurar global y marcar agotada solo por producto
        self.opt_inalambrica.in_stock = True
        self.opt_inalambrica.save()
        self.assign_con_cable.in_stock = False
        self.assign_con_cable.save()

        res3 = self.client.get(f"/api/products/{self.product.slug}/")
        opts3 = res3.json()["option_groups"][0]["options"]
        self.assertTrue(opts3[0]["in_stock"])
        self.assertFalse(opts3[1]["in_stock"])

    def test_r3_hidden_option_excluded_global_and_per_product(self):
        """R3: is_visible=False global o por producto excluye la opción; grupo sin opciones visibles no aparece."""
        # Ocultar Inalámbrica globalmente
        self.opt_inalambrica.is_visible = False
        self.opt_inalambrica.save()

        res1 = self.client.get(f"/api/products/{self.product.slug}/")
        opts1 = res1.json()["option_groups"][0]["options"]
        self.assertEqual([o["name"] for o in opts1], ["Con cable"])

        # Restaurar global y ocultar Con cable por producto
        self.opt_inalambrica.is_visible = True
        self.opt_inalambrica.save()
        self.assign_con_cable.is_visible = False
        self.assign_con_cable.save()

        res2 = self.client.get(f"/api/products/{self.product.slug}/")
        opts2 = res2.json()["option_groups"][0]["options"]
        self.assertEqual([o["name"] for o in opts2], ["Inalámbrica"])

        # Ocultar también Inalámbrica por producto -> grupo desaparece
        self.assign_inalambrica.is_visible = False
        self.assign_inalambrica.save()

        res3 = self.client.get(f"/api/products/{self.product.slug}/")
        self.assertEqual(res3.json()["option_groups"], [])

    def test_r4_dynamic_size_group_with_price_delta_and_override(self):
        """R4: Nuevo grupo Tamaño con price_delta y price_delta_override por producto."""
        tamano_group, _ = ProductOptionGroup.objects.get_or_create(
            slug="tamano",
            defaults={"name": "Tamaño", "order": 2, "is_active": True},
        )
        tamano_group.order = 2
        tamano_group.is_active = True
        tamano_group.save()

        opt_pequena = ProductOption.objects.create(
            group=tamano_group,
            name="Pequeña",
            slug="pequena",
            price_delta=0,
            order=1,
        )
        opt_grande = ProductOption.objects.create(
            group=tamano_group,
            name="Grande",
            slug="grande",
            price_delta=20000,
            order=2,
        )
        ProductOptionAssignment.objects.create(
            product=self.product,
            option=opt_pequena,
        )
        ProductOptionAssignment.objects.create(
            product=self.product,
            option=opt_grande,
        )
        # En otro producto, override de precio para Grande
        ProductOptionAssignment.objects.create(
            product=self.other_product,
            option=opt_grande,
            price_delta_override=35000,
        )

        res = self.client.get(f"/api/products/{self.product.slug}/")
        self.assertEqual(res.status_code, 200)
        groups = res.json()["option_groups"]
        self.assertEqual([g["name"] for g in groups], ["Conexión", "Tamaño"])
        size_opts = groups[1]["options"]
        self.assertEqual(
            [(o["name"], o["price_delta"]) for o in size_opts],
            [("Pequeña", 0), ("Grande", 20000)],
        )

        res_other = self.client.get(f"/api/products/{self.other_product.slug}/")
        self.assertEqual(
            res_other.json()["option_groups"][0]["options"][0]["price_delta"],
            35000,
        )

    def test_r5_product_without_options_and_all_options_out_of_stock(self):
        """R5: Producto sin opciones devuelve []; producto con todas agotadas devuelve grupo con todas in_stock=False."""
        res_empty = self.client.get(f"/api/products/{self.other_product.slug}/")
        self.assertEqual(res_empty.status_code, 200)
        self.assertEqual(res_empty.json()["option_groups"], [])

        self.opt_inalambrica.in_stock = False
        self.opt_inalambrica.save()
        self.opt_con_cable.in_stock = False
        self.opt_con_cable.save()

        res_all_oos = self.client.get(f"/api/products/{self.product.slug}/")
        self.assertEqual(res_all_oos.status_code, 200)
        opts = res_all_oos.json()["option_groups"][0]["options"]
        self.assertEqual(len(opts), 2)
        self.assertTrue(all(o["in_stock"] is False for o in opts))

    def test_admin_registration_and_list_editable(self):
        """Admin registra ProductOptionGroup, ProductOption con list_editable e inline en ProductAdmin."""
        self.assertIn(ProductOptionGroup, admin.site._registry)
        self.assertIn(ProductOption, admin.site._registry)
        option_admin = admin.site._registry[ProductOption]
        for field in ("is_visible", "in_stock", "price_delta", "order"):
            self.assertIn(field, option_admin.list_editable)
        self.assertTrue(
            any("ProductOptionAssignment" in str(inline) for inline in ProductAdmin.inlines)
        )
