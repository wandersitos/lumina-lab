from rest_framework import generics
from django.db.models import Q
from .models import Product
from .serializers import ProductSerializer

class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True).order_by('order', 'id')
        category = self.request.query_params.get('category')
        collection = self.request.query_params.get('collection')
        in_stock = self.request.query_params.get('in_stock')
        q = self.request.query_params.get('q')

        if category:
            queryset = queryset.filter(Q(category__iexact=category) | Q(category__icontains=category))
        if collection:
            queryset = queryset.filter(Q(collection__iexact=collection) | Q(collection__icontains=collection))
        if in_stock is not None:
            if in_stock.lower() in ('true', '1', 'yes'):
                queryset = queryset.filter(in_stock=True)
            elif in_stock.lower() in ('false', '0', 'no'):
                queryset = queryset.filter(in_stock=False)
        if q:
            queryset = queryset.filter(
                Q(name__icontains=q) |
                Q(description__icontains=q) |
                Q(category__icontains=q) |
                Q(collection__icontains=q)
            )
        return queryset

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    lookup_field = 'slug'
