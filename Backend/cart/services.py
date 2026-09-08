from .models import Cart, CartItem
from products.models import Product


class CartService:
    @staticmethod
    def get_or_create_cart(user):
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    @staticmethod
    def add_item(user, product_id, quantity):
        product = Product.objects.filter(id=product_id, is_active=True).first()
        if not product:
            raise ValueError("Product not found.")

        cart = CartService.get_or_create_cart(user)
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)

        new_quantity = quantity if created else cart_item.quantity + quantity
        if new_quantity > product.stock:
            raise ValueError(f"Only {product.stock} in stock.")

        cart_item.quantity = new_quantity
        cart_item.save()
        return cart

    @staticmethod
    def update_item_quantity(user, item_id, quantity):
        cart_item = CartItem.objects.filter(id=item_id, cart__user=user).first()
        if not cart_item:
            raise LookupError("Item not found.")

        if quantity <= 0:
            cart_item.delete()
            return None  # signals "item removed"

        if quantity > cart_item.product.stock:
            raise ValueError(f"Only {cart_item.product.stock} in stock.")

        cart_item.quantity = quantity
        cart_item.save()
        return cart_item.cart

    @staticmethod
    def remove_item(user, item_id):
        cart_item = CartItem.objects.filter(id=item_id, cart__user=user).first()
        if not cart_item:
            raise LookupError("Item not found.")
        cart_item.delete()