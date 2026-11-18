from django.urls import path
from .views import ShippingQuoteView

urlpatterns = [
    path('quote/', ShippingQuoteView.as_view(), name='shipping-quote'),
]
