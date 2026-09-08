from rest_framework import serializers
from .models import Order,OrderItem
from products.serializers import ProductSerializer




class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price', 'subtotal']





class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    
    class Meta:
        model = Order
        fields = ['id', 'total_price', 'status', 'created_at', 'items']