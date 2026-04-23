from rest_framework import serializers
from .models import Cart, CartItem
from apps.shop.models import ProductVariant
class VariantInCartSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    product_brand = serializers.CharField(source='product.brand', read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = ['id', 'sku', 'size', 'color', 'price', 'stock', 'product_id', 'product_name', 'product_brand', 'primary_image']

    def get_primary_image(self, obj):
        primary = obj.product.images.filter(is_primary=True).first()
        if not primary:
            primary = obj.product.images.first()
        if primary:
            request = self.context.get('request')
            return request.build_absolute_uri(primary.image.url) if request else primary.image.url
        return None

class CartItemSerializer(serializers.ModelSerializer):
    variant = VariantInCartSerializer(read_only=True)
    variant_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.all(), source='variant', write_only=True
    )
    subtotal = serializers.DecimalField(source='get_subtotal', max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'variant', 'variant_id', 'quantity', 'subtotal', 'added_at']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(source='get_total', max_digits=12, decimal_places=2, read_only=True)
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total', 'item_count', 'updated_at']

    def get_item_count(self, obj):
        return sum(item.quantity for item in obj.items.all())