from rest_framework import serializers
from .models import CartItem,Cart
from products.models import Product
from products.serializers import ProductSerializer


class CartItemSerializer(serializers.ModelSerializer):
     product = ProductSerializer(read_only=True)
     product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )
     subtotal = serializers.ReadOnlyField()
    
    
     class Meta:
        model= CartItem
        fields =['id', 'product', 'product_id', 'quantity', 'subtotal']



class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_price']