from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from django.db.models import Sum, Count
from django.conf import settings
from .models import Order, OrderItem
from .serializers import OrderSerializer
from apps.cart.models import Cart
from apps.shop.models import ProductVariant

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all().order_by('-created_at')
        return Order.objects.filter(user=user).order_by('-created_at')

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def dashboard_stats(self, request):
        total_orders = Order.objects.count()
        total_revenue = Order.objects.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        recent_orders = Order.objects.order_by('-created_at')[:5]
        
        return Response({
            'total_orders': total_orders,
            'total_revenue': total_revenue,
            'recent_orders': OrderSerializer(recent_orders, many=True).data
        })

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        user = request.user
        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        cart_items = cart.items.all()
        if not cart_items:
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        # Basic validation for stock
        for item in cart_items:
            if item.variant.stock < item.quantity:
                return Response(
                    {"error": f"Not enough stock for {item.variant.product.name} ({item.variant.size}). Available: {item.variant.stock}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        order = serializer.save(user=user)
        total_amount = 0

        for item in cart_items:
            # Deduct stock
            variant = item.variant
            variant.stock -= item.quantity
            variant.save()

            # Create OrderItem
            price = variant.price
            subtotal = price * item.quantity
            total_amount += subtotal

            OrderItem.objects.create(
                order=order,
                variant=variant,
                quantity=item.quantity,
                price=price
            )

        order.total_amount = total_amount
        order.save()

        # Clear the cart
        cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
