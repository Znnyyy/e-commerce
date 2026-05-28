
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Product, ProductVariant, ProductImage, Review
from .serializers import (
    ProductSerializer, ProductVariantSerializer, 
    ProductImageSerializer, ReviewSerializer
)
from apps.users.permissions import ProductAccessPermission, ReviewAccessPermission

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [ReviewAccessPermission]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        queryset = super().get_queryset()
        product_id = self.request.query_params.get('product')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset.order_by('-created_at')

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [ProductAccessPermission]

    def get_queryset(self):
        queryset = super().get_queryset()
        gender = self.request.query_params.get('gender')
        brand = self.request.query_params.get('brand')
        search = self.request.query_params.get('search')
        ordering = self.request.query_params.get('ordering', '-created_at')

        if gender:
            queryset = queryset.filter(gender__iexact=gender)
        if brand:
            queryset = queryset.filter(brand__iexact=brand)
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(brand__icontains=search)
            )

        allowed_orderings = ['created_at', '-created_at', 'name', '-name']
        if ordering in allowed_orderings:
            queryset = queryset.order_by(ordering)
        return queryset

    @action(detail=False, methods=['get'])
    def nav_info(self, request):
        brands = Product.objects.exclude(brand='').values_list('brand', flat=True).distinct()
        genders = Product.objects.values_list('gender', flat=True).distinct()
        return Response({
            'brands': list(brands),
            'genders': list(genders)
        })

class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [ProductAccessPermission]

class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [ProductAccessPermission]

    @action(detail=True, methods=['post'])
    def set_primary(self, request, pk=None):
        image = self.get_object()
        ProductImage.objects.filter(product=image.product).update(is_primary=False)
        image.is_primary = True
        image.save()
        return Response({'status': 'primary set'})