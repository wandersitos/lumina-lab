from django.urls import path
from .views import ProductListView, ProductDetailView, ClearCatalogCacheView

urlpatterns = [
    path('', ProductListView.as_view(), name='product-list'),
    path('cache/clear/', ClearCatalogCacheView.as_view(), name='product-cache-clear'),
    path('<slug:slug>/', ProductDetailView.as_view(), name='product-detail'),
]
