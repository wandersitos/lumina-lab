from django.contrib import admin
from django.urls import path, include
from config.views import health_check
from products.views import ContentListView

admin.site.site_header = "Lumina Lab — Control de Pedidos e Impresión 3D"
admin.site.site_title = "Lumina Lab Admin"
admin.site.index_title = "Administración de Tienda y Pedidos"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health_check'),
    path('api/content/', ContentListView.as_view(), name='site_content'),
    path('api/products/', include('products.urls')),
    path('api/shipping/', include('shipping.urls')),
    path('api/checkout/', include('orders.urls')),
]

