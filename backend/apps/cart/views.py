
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer

class CartViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def _get_or_create_cart(self, user):
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    # GET /api/cart/  → ambil seluruh isi cart
    def list(self, request):
        cart = self._get_or_create_cart(request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    # POST /api/cart/add/  → tambah item ke cart
    @action(detail=False, methods=['post'], url_path='add')
    def add_item(self, request):
        cart = self._get_or_create_cart(request.user)
        variant_id = request.data.get('variant_id')
        quantity = int(request.data.get('quantity', 1))

        if not variant_id:
            return Response({'error': 'variant_id is required'}, status=400)

        try:
            from apps.shop.models import ProductVariant
            variant = ProductVariant.objects.get(id=variant_id)
        except ProductVariant.DoesNotExist:
            return Response({'error': 'Variant not found'}, status=404)

        if variant.stock < quantity:
            return Response({'error': 'Not enough stock'}, status=400)

        item, created = CartItem.objects.get_or_create(cart=cart, variant=variant)
        new_quantity = item.quantity + quantity if not created else quantity
        
        if new_quantity > variant.stock:
            return Response({'error': f'Stok tidak mencukupi. Hanya tersedia {variant.stock} item.'}, status=400)
            
        item.quantity = new_quantity
        item.save()

        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data, status=200)

    # PATCH /api/cart/update/{item_id}/  → ubah quantity
    @action(detail=False, methods=['patch'], url_path='update/(?P<item_id>[^/.]+)')
    def update_item(self, request, item_id=None):
        cart = self._get_or_create_cart(request.user)
        quantity = int(request.data.get('quantity', 1))

        try:
            item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found'}, status=404)

        if quantity <= 0:
            item.delete()
        else:
            if item.variant.stock < quantity:
                return Response({'error': 'Not enough stock'}, status=400)
            item.quantity = quantity
            item.save()

        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    # DELETE /api/cart/remove/{item_id}/  → hapus satu item
    @action(detail=False, methods=['delete'], url_path='remove/(?P<item_id>[^/.]+)')
    def remove_item(self, request, item_id=None):
        cart = self._get_or_create_cart(request.user)
        try:
            item = CartItem.objects.get(id=item_id, cart=cart)
            item.delete()
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found'}, status=404)

        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    # DELETE /api/cart/clear/  → kosongkan semua
    @action(detail=False, methods=['delete'], url_path='clear')
    def clear_cart(self, request):
        cart = self._get_or_create_cart(request.user)
        cart.items.all().delete()
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)
