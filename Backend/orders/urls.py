from django.urls import path
from .views import CheckoutView, OrderListView, OrderDetailView
from .webhooks import StripeWebhookView

urlpatterns = [
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
    path('', OrderListView.as_view(), name='order-list'),
    path('<int:order_id>/', OrderDetailView.as_view(), name='order-detail'),
]