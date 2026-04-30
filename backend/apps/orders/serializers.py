from rest_framework import serializers
from .models import Order, OrderItem
from apps.shop.models import ProductVariant, ProductImage

class OrderVariantSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_id = serializers.ReadOnlyField(source='product.id')
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = ['id', 'sku', 'size', 'color', 'price', 'stock', 'product_name', 'product_id', 'primary_image']

    def get_primary_image(self, obj):
        primary = obj.product.images.filter(is_primary=True).first()
        if not primary:
            primary = obj.product.images.first()
        if primary and primary.image:
            image = primary.image
            # Cloudinary menyimpan sebagai string URL langsung
            if isinstance(image, str):
                return image
            # Fallback untuk ImageField lama
            try:
                return image.url
            except Exception:
                return str(image)
        return None

class OrderItemSerializer(serializers.ModelSerializer):
    variant_details = OrderVariantSerializer(source='variant', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'variant', 'variant_details', 'quantity', 'price']
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

