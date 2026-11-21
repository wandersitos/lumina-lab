from rest_framework import generics
from django.db.models import Q
from .models import Product
from .serializers import ProductSerializer

class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True).order_by('id')
        category = self.request.query_params.get('category')
        collection = self.request.query_params.get('collection')
        q = self.request.query_params.get('q')

        if category:
            queryset = queryset.filter(Q(name__icontains=category) | Q(description__icontains=category))
        if collection:
            queryset = queryset.filter(Q(name__icontains=collection) | Q(description__icontains=collection))
        if q:
            queryset = queryset.filter(Q(name__icontains=q) | Q(description__icontains=q))
        return queryset

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    lookup_field = 'slug'
