from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .adapters import EnvioclickAdapter

class ShippingQuoteView(APIView):
    """
    Endpoint para cotizar envíos a ciudades en Colombia vía EnvioclickAdapter.
    """
    def post(self, request, *args, **kwargs):
        data = request.data or {}
        city = data.get('city')
        department = data.get('department', '')
        items_count = data.get('items_count', 1)

        if not city or not str(city).strip():
            return Response(
                {'error': 'El campo city es obligatorio y no puede estar vacío.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            items_count = int(items_count)
            if items_count < 1:
                items_count = 1
        except (ValueError, TypeError):
            items_count = 1

        adapter = EnvioclickAdapter()
        try:
            quote = adapter.calculate_quote(
                city=str(city),
                department=str(department),
                items_count=items_count
            )
            return Response(quote, status=status.HTTP_200_OK)
        except ValueError as err:
            return Response({'error': str(err)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            return Response({'error': 'Error al procesar la cotización'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
