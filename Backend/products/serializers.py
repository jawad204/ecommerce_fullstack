from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True, required=False
    )
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price',
            'stock', 'image',  'in_stock',
            'category', 'category_id', 'owner',
            'created_at', 'updated_at',
        ]