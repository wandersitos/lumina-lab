from unittest.mock import patch

from django.contrib import admin
from django.core.cache import cache
from django.test import TestCase
from rest_framework.test import APIClient

from products.admin import (
    ProductAdmin,
    ProductOptionAdmin,
    ProductOptionAssignmentInline,
)
from products.models import (
    Product,
    ProductOption,
    ProductOptionAssignment,
    ProductOptionGroup,
)
from products.views import CATALOG_CACHE_TIMEOUT


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

    def test_023_r1_admin_hides_material_and_exposes_option_detail_fields(self):
        """R1 (023): material fuera de ProductAdmin.fields; ProductOptionAdmin e Inline exponen price, dimensions y production_time."""
        self.assertNotIn("material", ProductAdmin.fields)

        option_admin = admin.site._registry[ProductOption]
        for field in ("price", "dimensions", "production_time"):
            self.assertIn(field, option_admin.list_display)

        for field in ("price_override", "dimensions_override", "production_time_override"):
            self.assertIn(field, ProductOptionAssignmentInline.fields)

    def test_023_r2_r4_option_effective_price_dimensions_and_production_time(self):
        """R2/R4 (023): option_groups devuelve effective_price, effective_dimensions y effective_production_time (global, override y fallback)."""
        tamano_group, _ = ProductOptionGroup.objects.get_or_create(
            slug="tamano",
            defaults={"name": "Tamaño", "order": 2, "is_active": True},
        )
        opt_pequena = ProductOption.objects.create(
            group=tamano_group,
            name="Pequeña",
            slug="pequena-023",
            price_delta=0,
            order=1,
        )
        opt_grande = ProductOption.objects.create(
            group=tamano_group,
            name="Grande",
            slug="grande-023",
            price_delta=0,
            price=220000,
            dimensions="30 x 30 cm",
            production_time="5-7 días",
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
        ProductOptionAssignment.objects.create(
            product=self.other_product,
            option=opt_grande,
            price_override=260000,
            dimensions_override="35 x 35 cm",
            production_time_override="7-10 días",
        )

        res = self.client.get(f"/api/products/{self.product.slug}/")
        self.assertEqual(res.status_code, 200)
        tamano_data = next(g for g in res.json()["option_groups"] if g["slug"] == "tamano")
        by_slug = {o["slug"]: o for o in tamano_data["options"]}

        # Opción Grande toma los valores globales de ProductOption
        self.assertEqual(by_slug["grande-023"]["effective_price"], 220000)
        self.assertEqual(by_slug["grande-023"]["effective_dimensions"], "30 x 30 cm")
        self.assertEqual(by_slug["grande-023"]["effective_production_time"], "5-7 días")

        # R4: Opción Pequeña sin valores propios devuelve None / "" para fallback en cliente
        self.assertIsNone(by_slug["pequena-023"]["effective_price"])
        self.assertEqual(by_slug["pequena-023"]["effective_dimensions"], "")
        self.assertEqual(by_slug["pequena-023"]["effective_production_time"], "")

        # Override por producto en other_product
        res_other = self.client.get(f"/api/products/{self.other_product.slug}/")
        self.assertEqual(res_other.status_code, 200)
        other_opt = res_other.json()["option_groups"][0]["options"][0]
        self.assertEqual(other_opt["effective_price"], 260000)
        self.assertEqual(other_opt["effective_dimensions"], "35 x 35 cm")
        self.assertEqual(other_opt["effective_production_time"], "7-10 días")

    def test_023_r3_cache_three_months_and_invalidation_on_option_save_delete(self):
        """R3 (023): ProductListView y ProductDetailView cachean 3 meses (7776000 s) con option_groups e invalidan al guardar/eliminar opciones."""
        self.assertEqual(CATALOG_CACHE_TIMEOUT, 7776000)
        cache.clear()

        with patch("products.views.cache.set", wraps=cache.set) as mock_set:
            list_res = self.client.get("/api/products/")
            self.assertEqual(list_res.status_code, 200)
            detail_res = self.client.get(f"/api/products/{self.product.slug}/")
            self.assertEqual(detail_res.status_code, 200)

            self.assertGreaterEqual(mock_set.call_count, 2)
            for call in mock_set.call_args_list:
                self.assertEqual(call.kwargs.get("timeout"), CATALOG_CACHE_TIMEOUT)

        # Modificar una opción debe invalidar la caché
        tamano_group, _ = ProductOptionGroup.objects.get_or_create(
            slug="tamano",
            defaults={"name": "Tamaño", "order": 2, "is_active": True},
        )
        opt = ProductOption.objects.create(
            group=tamano_group,
            name="Mediana",
            slug="mediana-cache-023",
            price=190000,
            dimensions="25 x 25 cm",
            production_time="4-5 días",
            order=3,
        )
        assignment = ProductOptionAssignment.objects.create(
            product=self.product,
            option=opt,
        )
        res_after_save = self.client.get(f"/api/products/{self.product.slug}/")
        self.assertEqual(res_after_save.status_code, 200)
        slugs = [
            o["slug"]
            for g in res_after_save.json()["option_groups"]
            for o in g["options"]
        ]
        self.assertIn("mediana-cache-023", slugs)

        # Eliminar asignación también debe invalidar caché
        assignment.delete()
        res_after_delete = self.client.get(f"/api/products/{self.product.slug}/")
        self.assertEqual(res_after_delete.status_code, 200)
        slugs_after = [
            o["slug"]
            for g in res_after_delete.json()["option_groups"]
            for o in g["options"]
        ]
        self.assertNotIn("mediana-cache-023", slugs_after)
