from django.urls import path
from orders.views import CheckoutView

urlpatterns = [
    path('', CheckoutView.as_view(), name='checkout'),
]
