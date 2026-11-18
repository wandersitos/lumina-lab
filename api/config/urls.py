from django.contrib import admin
from django.urls import path, include
from config.views import health_check

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health_check'),
    path('api/products/', include('products.urls')),
    path('api/shipping/', include('shipping.urls')),
]

