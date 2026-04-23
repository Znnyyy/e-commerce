from django.contrib import admin
from .models import Product, ProductVariant, ProductImage

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'created_at')
    search_fields = ('name', 'brand')
    inlines = [ProductVariantInline, ProductImageInline]
