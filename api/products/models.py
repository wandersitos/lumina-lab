from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)  # COP
    dimensions = models.CharField(max_length=100, blank=True)
    image_url = models.URLField(max_length=500, blank=True)
    colors = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Nuevos campos catálogo Lumina Lab
    collection = models.CharField(max_length=50, blank=True, default='')
    category = models.CharField(max_length=50, blank=True, default='')
    in_stock = models.BooleanField(default=True)
    images = models.JSONField(default=list, blank=True)
    order = models.IntegerField(default=99)
    material = models.CharField(max_length=150, blank=True, default='')

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        from django.core.cache import cache
        cache.clear()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        from django.core.cache import cache
        cache.clear()
        super().delete(*args, **kwargs)


class Content(models.Model):
    """
    Tabla clave-valor para almacenar configuraciones editables del sitio
    (teléfono WhatsApp, Instagram, imagen destacada, etc.) con soporte de caché.
    """
    key = models.CharField(max_length=100, unique=True, db_index=True, verbose_name="Clave")
    value = models.TextField(blank=True, default="", verbose_name="Valor")
    description = models.CharField(max_length=255, blank=True, default="", verbose_name="Descripción")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Última modificación")

    class Meta:
        verbose_name = "Contenido / Configuración"
        verbose_name_plural = "Contenidos / Configuraciones"
        ordering = ['key']

    def __str__(self):
        return f"{self.key}: {self.value[:30]}"

    def save(self, *args, **kwargs):
        from django.core.cache import cache
        cache.delete('lumina_site_content_dict')
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        from django.core.cache import cache
        cache.delete('lumina_site_content_dict')
        super().delete(*args, **kwargs)


class ProductOptionGroup(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nombre")
    slug = models.SlugField(max_length=100, unique=True)
    order = models.IntegerField(default=0, verbose_name="Orden")
    is_active = models.BooleanField(default=True, verbose_name="Activo")

    class Meta:
        ordering = ['order', 'id']
        verbose_name = "Grupo de opciones"
        verbose_name_plural = "Grupos de opciones"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        from django.core.cache import cache
        cache.clear()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        from django.core.cache import cache
        cache.clear()
        super().delete(*args, **kwargs)


class ProductOption(models.Model):
    group = models.ForeignKey(
        ProductOptionGroup,
        on_delete=models.CASCADE,
        related_name='options',
        verbose_name="Grupo",
    )
    name = models.CharField(max_length=100, verbose_name="Nombre")
    slug = models.SlugField(max_length=100)
    price_delta = models.IntegerField(default=0, verbose_name="Variación de precio (COP)")
    price = models.IntegerField(null=True, blank=True, verbose_name="Precio propio (COP)")
    dimensions = models.CharField(max_length=100, blank=True, default='', verbose_name="Dimensiones")
    production_time = models.CharField(max_length=100, blank=True, default='', verbose_name="Tiempo de producción")
    is_visible = models.BooleanField(default=True, verbose_name="Visible")
    in_stock = models.BooleanField(default=True, verbose_name="Disponible")
    order = models.IntegerField(default=0, verbose_name="Orden")

    class Meta:
        ordering = ['order', 'id']
        unique_together = [('group', 'slug')]
        verbose_name = "Opción de producto"
        verbose_name_plural = "Opciones de producto"

    def __str__(self):
        return f"{self.group.name}: {self.name}"

    def save(self, *args, **kwargs):
        from django.core.cache import cache
        cache.clear()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        from django.core.cache import cache
        cache.clear()
        super().delete(*args, **kwargs)


class ProductOptionAssignment(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='option_assignments',
        verbose_name="Producto",
    )
    option = models.ForeignKey(
        ProductOption,
        on_delete=models.CASCADE,
        related_name='product_assignments',
        verbose_name="Opción",
    )
    is_visible = models.BooleanField(default=True, verbose_name="Visible en este producto")
    in_stock = models.BooleanField(default=True, verbose_name="Disponible en este producto")
    price_delta_override = models.IntegerField(
        null=True,
        blank=True,
        verbose_name="Variación de precio específica (COP)",
    )
    price_override = models.IntegerField(
        null=True,
        blank=True,
        verbose_name="Precio propio específico (COP)",
    )
    dimensions_override = models.CharField(
        max_length=100,
        blank=True,
        default='',
        verbose_name="Dimensiones específicas",
    )
    production_time_override = models.CharField(
        max_length=100,
        blank=True,
        default='',
        verbose_name="Tiempo de producción específico",
    )

    class Meta:
        ordering = ['option__group__order', 'option__order', 'id']
        unique_together = [('product', 'option')]
        verbose_name = "Asignación de opción"
        verbose_name_plural = "Asignaciones de opciones"

    def __str__(self):
        return f"{self.product.name} — {self.option}"

    def save(self, *args, **kwargs):
        from django.core.cache import cache
        cache.clear()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        from django.core.cache import cache
        cache.clear()
        super().delete(*args, **kwargs)
