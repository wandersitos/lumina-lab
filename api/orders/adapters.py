from abc import ABC, abstractmethod

class PaymentGatewayPort(ABC):
    """Puerto de pasarela de pago (Arquitectura Hexagonal)."""

    @abstractmethod
    def create_checkout(self, order) -> dict:
        """Genera datos de checkout incluyendo la URL de pago y proveedor."""
        pass


class WompiPaymentAdapter(PaymentGatewayPort):
    """
    Adaptador para la pasarela de pagos Wompi (Colombia).
    En modo sandbox/mock determinista genera URLs de checkout para simulación.
    """

    def __init__(self, sandbox: bool = True):
        self.sandbox = sandbox

    def create_checkout(self, order) -> dict:
        base_url = "https://checkout.wompi.co/l"
        url = f"{base_url}/sim_{order.order_number}"
        return {
            "payment_url": url,
            "provider": "wompi"
        }


class PaymentService:
    """Servicio de aplicación que orquesta el gateway de pago inyectado."""

    def __init__(self, gateway: PaymentGatewayPort = None):
        self.gateway = gateway or WompiPaymentAdapter()

    def generate_checkout(self, order) -> dict:
        return self.gateway.create_checkout(order)
