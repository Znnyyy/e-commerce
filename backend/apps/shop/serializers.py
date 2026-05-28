from rest_framework import serializers
from django.db.models import Avg
from .models import Product, ProductVariant, ProductImage, Review

class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'sku', 'size', 'color', 'price', 'stock', 'product']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_primary', 'product']

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    avatar = serializers.URLField(source='user.profile.avatar', read_only=True)
    product_name = serializers.ReadOnlyField(source='product.name')
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'product', 'product_name', 'product_image', 'user', 'order', 'username', 'avatar', 'rating', 'comment', 'created_at']
        read_only_fields = ['user']

    def get_product_image(self, obj):
        primary_image = obj.product.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = obj.product.images.first()
        return primary_image.image if primary_image else None

class ProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    can_review = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'brand', 'gender', 'description', 
            'variants', 'images', 'average_rating', 'review_count', 
            'can_review', 'created_at'
        ]

    def get_average_rating(self, obj):
        avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 0

    def get_review_count(self, obj):
        return obj.reviews.count()

    def get_can_review(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None

        from apps.orders.models import Order
        purchased_orders = Order.objects.filter(
            user=request.user,
            items__variant__product=obj,
            status__in=['paid', 'shipped']
        ).distinct()

        if not purchased_orders.exists():
            return None

        for order in purchased_orders:
            if not obj.reviews.filter(user=request.user, order=order).exists():
                return order.id
        
        return None