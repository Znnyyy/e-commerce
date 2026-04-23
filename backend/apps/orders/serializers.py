from rest_framework import serializers
from .models import Order, OrderItem
from apps.shop.serializers import ProductVariantSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    variant_details = ProductVariantSerializer(source='variant', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'variant', 'variant_details', 'quantity', 'price', 'get_subtotal']
        read_only_fields = ['price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'status', 'total_amount', 
            'shipping_name', 'shipping_address', 'shipping_city', 'shipping_phone',
            'created_at', 'items'
        ]
        read_only_fields = ['status', 'total_amount', 'created_at']
