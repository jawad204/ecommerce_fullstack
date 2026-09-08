import stripe
from django.conf import settings
from django.db import transaction
from cart.models import Cart
from products.models import Product
from .models import Order, OrderItem

stripe.api_key = settings.STRIPE_SECRET_KEY


class OrderService:

    @staticmethod
    @transaction.atomic
    def checkout(user):
        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            raise ValueError("Cart is empty.")

        cart_items = list(cart.items.select_related('product').all())
        if not cart_items:
            raise ValueError("Cart is empty.")

        product_ids = [item.product.id for item in cart_items]
        locked_products = {
            p.id: p for p in Product.objects.select_for_update().filter(id__in=product_ids)
        }

        for item in cart_items:
            product = locked_products[item.product.id]
            if item.quantity > product.stock:
                raise ValueError(f"'{product.name}' only has {product.stock} in stock.")

        order = Order.objects.create(user=user, total_price=cart.total_price, status='pending')

        for item in cart_items:
            product = locked_products[item.product.id]
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item.quantity,
                price=product.price,
            )
            # stock NOT reduced here — only after payment confirms, via webhook

        intent = stripe.PaymentIntent.create(
            amount=int(order.total_price * 100),
            currency='usd',
            metadata={'order_id': order.id},
        )
        order.stripe_payment_intent_id = intent.id
        order.save()

        return order, intent.client_secret

    @staticmethod
    def get_user_orders(user):
        return Order.objects.filter(user=user).prefetch_related('items__product').order_by('-created_at')

    @staticmethod
    def get_order(user, order_id):
        order = Order.objects.filter(id=order_id, user=user).prefetch_related('items__product').first()
        if not order:
            raise LookupError("Order not found.")
        return order

    @staticmethod
    @transaction.atomic
    def mark_paid_and_reduce_stock(order):
        if order.status == 'paid':
            return order  # already processed — avoid double-processing duplicate webhook calls

        order_items = order.items.select_related('product').all()
        product_ids = [item.product.id for item in order_items if item.product]
        locked_products = {
            p.id: p for p in Product.objects.select_for_update().filter(id__in=product_ids)
        }

        for item in order_items:
            if item.product:
                product = locked_products[item.product.id]
                product.stock -= item.quantity
                product.save()

        order.status = 'paid'
        order.save()

        cart = Cart.objects.filter(user=order.user).first()
        if cart:
            cart.items.all().delete()

        return order