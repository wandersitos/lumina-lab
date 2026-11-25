from rest_framework import generics, status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.core.cache import cache
from .models import Product, Content
from .serializers import ProductSerializer


def _check_refresh_permission(request):
    """
    Valida si se solicita refresco forzado (?refresh=true/1/yes) y verifica que el usuario
    esté autenticado como administrador (is_staff=True).
    """
    force_refresh = request.query_params.get('refresh') in ('true', '1', 'yes')
    if force_refresh and not (request.user and request.user.is_authenticated and request.user.is_staff):
        return True, Response(
            {'detail': 'No tienes permisos para refrescar la caché.'},
            status=status.HTTP_403_FORBIDDEN,
        )
    return force_refresh, None


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

    def list(self, request, *args, **kwargs):
        # Soporte de invalidación / refresco forzado de caché
        force_refresh, denied_response = _check_refresh_permission(request)
        if denied_response is not None:
            return denied_response

        query_string = request.META.get('QUERY_STRING', '')
        cache_key = f'lumina_products_list_{query_string}'

        if not force_refresh:
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return Response(cached_data)

        # Si no está en caché o se pidió refrescar, consultar BD
        response = super().list(request, *args, **kwargs)
        cache.set(cache_key, response.data, timeout=900)  # 15 minutos
        return response


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    lookup_field = 'slug'

    def retrieve(self, request, *args, **kwargs):
        slug = kwargs.get('slug')
        force_refresh, denied_response = _check_refresh_permission(request)
        if denied_response is not None:
            return denied_response

        cache_key = f'lumina_product_detail_{slug}'

        if not force_refresh:
            cached = cache.get(cache_key)
            if cached is not None:
                return Response(cached)

        response = super().retrieve(request, *args, **kwargs)
        cache.set(cache_key, response.data, timeout=900)
        return response


class ClearCatalogCacheView(APIView):
    """Endpoint para limpiar y refrescar toda la caché de catálogo bajo demanda."""
    permission_classes = [IsAdminUser]

    def post(self, request, *args, **kwargs):
        cache.clear()
        return Response({'status': 'ok', 'message': 'Caché de catálogo limpiada exitosamente.'})

    def get(self, request, *args, **kwargs):
        cache.clear()
        return Response({'status': 'ok', 'message': 'Caché de catálogo limpiada exitosamente.'})


class ContentListView(APIView):
    """
    Endpoint de clave-valor para contenidos editables del sitio
    (WhatsApp, Instagram, imagen hero, etc.) con soporte de caché.
    """
    def get(self, request, *args, **kwargs):
        force_refresh, denied_response = _check_refresh_permission(request)
        if denied_response is not None:
            return denied_response

        cache_key = 'lumina_site_content_dict'

        if not force_refresh:
            cached_data = cache.get(cache_key)
            if cached_data is not None:
                return Response(cached_data)

        qs = Content.objects.all()
        data = {c.key: c.value for c in qs}

        defaults = {
            'whatsapp_number': '+573001234567',
            'instagram_handle': '@luminalab_co',
            'instagram_url': 'https://www.instagram.com/luminalab_co/',
            'hero_image_url': 'https://res.cloudinary.com/dja3bhm9j/image/upload/v1795490346/Leora-Floral-May-2025_4_ue6skw.jpg',
        }
        for k, v in defaults.items():
            if k not in data or not data[k]:
                data[k] = v

        cache.set(cache_key, data, timeout=900)  # 15 minutos
        return Response(data)
