import uuid
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.models import Order
from orders.adapters import PaymentService

class CheckoutView(APIView):
    """
    Endpoint para procesar el checkout y creación de órdenes.
    POST /api/checkout/
    """

    def post(self, request):
        data = request.data or {}

        customer_name = (data.get('customer_name') or '').strip()
        customer_email = (data.get('customer_email') or '').strip()
        customer_phone = (data.get('customer_phone') or '').strip()
        shipping_address = (data.get('shipping_address') or '').strip()
        shipping_city = (data.get('shipping_city') or '').strip()
        items = data.get('items')

        # Validaciones de campos obligatorios
        missing_fields = []
        if not customer_name:
            missing_fields.append('customer_name')
        if not customer_email:
            missing_fields.append('customer_email')
        if not customer_phone:
            missing_fields.append('customer_phone')
        if not shipping_address:
            missing_fields.append('shipping_address')
        if not shipping_city:
            missing_fields.append('shipping_city')

        if missing_fields:
            return Response(
                {
                    "error": f"Campos obligatorios faltantes: {', '.join(missing_fields)}",
                    "missing_fields": missing_fields
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validación de items
        if not isinstance(items, list) or len(items) == 0:
            return Response(
                {"error": "El carrito no contiene productos válidos para procesar la orden."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Cálculo de subtotal y total
        subtotal = 0
        for item in items:
            item_price = int(item.get('price', 0))
            item_qty = int(item.get('quantity', 1))
            subtotal += item_price * item_qty

        try:
            shipping_cost = int(data.get('shipping_cost', 0))
        except (ValueError, TypeError):
            shipping_cost = 0

        total_amount = subtotal + shipping_cost

        # Generación de número de orden único
        date_prefix = timezone.now().strftime('%Y%m%d')
        unique_suffix = uuid.uuid4().hex[:6].upper()
        order_number = f"LUM-{date_prefix}-{unique_suffix}"

        # Persistencia inicial
        order = Order.objects.create(
            order_number=order_number,
            customer_name=customer_name,
            customer_email=customer_email,
            customer_phone=customer_phone,
            shipping_address=shipping_address,
            shipping_city=shipping_city,
            items_summary=items,
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            total_amount=total_amount,
            status='PENDIENTE',
        )

        # Orquestación de pasarela de pago (puerto/adaptador)
        payment_service = PaymentService()
        checkout_info = payment_service.generate_checkout(order)
        order.payment_url = checkout_info.get('payment_url', '')
        order.save(update_fields=['payment_url'])

        return Response(
            {
                "order_id": order.id,
                "order_number": order.order_number,
                "status": order.status,
                "total_amount": order.total_amount,
                "payment_url": order.payment_url,
            },
            status=status.HTTP_201_CREATED
        )
