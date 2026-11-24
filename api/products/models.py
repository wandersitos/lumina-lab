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
