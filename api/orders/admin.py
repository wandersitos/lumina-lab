from django.contrib import admin
from .models import Order


@admin.action(description="Marcar seleccionados como En Preparación (Cola 3D)")
def marcar_como_en_preparacion(modeladmin, request, queryset):
    updated = queryset.update(status='EN_PREPARACION')
    modeladmin.message_user(request, f"{updated} pedido(s) actualizados a En Preparación.")


@admin.action(description="Marcar seleccionados como Enviado")
def marcar_como_enviado(modeladmin, request, queryset):
    updated = queryset.update(status='ENVIADO')
    modeladmin.message_user(request, f"{updated} pedido(s) actualizados a Enviado.")


@admin.action(description="Marcar seleccionados como Cancelado")
def marcar_como_cancelado(modeladmin, request, queryset):
    updated = queryset.update(status='CANCELADO')
    modeladmin.message_user(request, f"{updated} pedido(s) actualizados a Cancelado.")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_number',
        'customer_name',
        'customer_phone',
        'shipping_city',
        'total_amount',
        'status',
        'tracking_number',
        'created_at',
    )
    list_filter = ('status', 'shipping_city', 'created_at')
    search_fields = (
        'order_number',
        'customer_name',
        'customer_email',
        'customer_phone',
        'shipping_city',
        'tracking_number',
    )
    readonly_fields = ('order_number', 'created_at', 'updated_at')
    actions = [marcar_como_en_preparacion, marcar_como_enviado, marcar_como_cancelado]
