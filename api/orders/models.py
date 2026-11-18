import uuid
from django.db import models
from django.utils import timezone

class Order(models.Model):
    order_number = models.CharField(max_length=64, unique=True, db_index=True)
    customer_name = models.CharField(max_length=200)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=50)
    shipping_address = models.CharField(max_length=255)
    shipping_city = models.CharField(max_length=100)
    items_summary = models.JSONField(default=list)
    subtotal = models.IntegerField(default=0)
    shipping_cost = models.IntegerField(default=0)
    total_amount = models.IntegerField(default=0)
    status = models.CharField(max_length=50, default='PENDIENTE')
    payment_url = models.URLField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.order_number:
            date_prefix = timezone.now().strftime('%Y%m%d')
            unique_suffix = uuid.uuid4().hex[:6].upper()
            self.order_number = f"LUM-{date_prefix}-{unique_suffix}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.order_number} ({self.customer_name}) - ${self.total_amount} COP"
