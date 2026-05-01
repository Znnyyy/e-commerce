from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Product, ProductVariant, ProductImage
from .serializers import ProductSerializer, ProductVariantSerializer, ProductImageSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        gender = self.request.query_params.get('gender')
        brand = self.request.query_params.get('brand')
        ordering = self.request.query_params.get('ordering', '-created_at')
        if gender:
            queryset = queryset.filter(gender__iexact=gender)
        if brand:
            queryset = queryset.filter(brand__iexact=brand)
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

class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    # parser_classes dihapus karena sekarang hanya menerima JSON (URL string)

    @action(detail=True, methods=['post'])
    def set_primary(self, request, pk=None):
        image = self.get_object()
        ProductImage.objects.filter(product=image.product).update(is_primary=False)
        image.is_primary = True
        image.save()
        return Response({'status': 'primary set'})