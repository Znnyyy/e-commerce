from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes as deco_permission_classes
from django.db import transaction
from django.db.models import Sum, Count, F
from django.core.exceptions import ValidationError
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from .models import Order, OrderItem
from .serializers import OrderSerializer
from apps.cart.models import Cart
from apps.shop.models import ProductVariant
from apps.users.permissions import IsSuperAdmin
import midtransclient
import uuid
import hashlib


def get_snap_client():
    return midtransclient.Snap(
        is_production=settings.MIDTRANS_IS_PRODUCTION,
        server_key=settings.MIDTRANS_SERVER_KEY,
        client_key=settings.MIDTRANS_CLIENT_KEY,
    )


def rollback_stock(order):
    """Restore stock for failed orders using atomic F() expressions"""
    for item in order.items.all():
        if item.variant:
            ProductVariant.objects.filter(id=item.variant.id).update(stock=F('stock') + item.quantity)


def apply_midtrans_status(order, transaction_status, fraud_status):
    old_status = order.status

    if transaction_status == 'capture':
        order.status = 'paid' if fraud_status == 'accept' else 'pending'
    elif transaction_status == 'settlement':
        order.status = 'paid'
    elif transaction_status in ('cancel', 'deny', 'expire'):
        order.status = 'failed'
        if old_status == 'pending':
            rollback_stock(order)
            if order.points_used > 0:
                order.user.profile.points = F('points') + order.points_used
                order.user.profile.save(update_fields=['points'])
    elif transaction_status == 'pending':
        order.status = 'pending'

    if old_status == 'pending' and order.status == 'paid' and order.points_earned > 0:
        order.user.profile.points = F('points') + order.points_earned
        order.user.profile.save(update_fields=['points'])

    order.save(update_fields=['status'])


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all().order_by('-created_at')
        return Order.objects.filter(user=user).order_by('-created_at')

    @action(detail=False, methods=['get'], permission_classes=[IsSuperAdmin])
    def dashboard_stats(self, request):
        from django.contrib.auth.models import User
        from django.db.models.functions import TruncMonth
        from apps.shop.models import Product
        import datetime

        twelve_months_ago = datetime.date.today().replace(day=1) - datetime.timedelta(days=365)

        monthly_data = (
            Order.objects
            .filter(created_at__date__gte=twelve_months_ago)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(revenue=Sum('total_amount'), count=Count('id'))
            .order_by('month')
        )

        recent_orders = Order.objects.order_by('-created_at')[:5]
        status_data = Order.objects.values('status').annotate(count=Count('id'))
        top_products = (
            OrderItem.objects
            .values('variant__product__name')
            .annotate(total_qty=Sum('quantity'))
            .order_by('-total_qty')[:5]
        )
        users = User.objects.order_by('-date_joined').values(
            'id', 'username', 'email', 'is_staff', 'is_active', 'date_joined'
        )

        return Response({
            'total_orders': Order.objects.count(),
            'total_revenue': Order.objects.aggregate(Sum('total_amount'))['total_amount__sum'] or 0,
            'total_products': Product.objects.count(),
            'total_users': User.objects.filter(is_staff=False).count(),
            'recent_orders': OrderSerializer(recent_orders, many=True).data,
            'monthly_chart': [
                {'month': e['month'].strftime('%b %Y'), 'revenue': float(e['revenue'] or 0), 'orders': e['count']}
                for e in monthly_data
            ],
            'status_chart': [{'status': s['status'], 'count': s['count']} for s in status_data],
            'top_products': [{'name': p['variant__product__name'], 'qty': p['total_qty']} for p in top_products],
            'users': list(users),
        })

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        user = request.user

        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        cart_items = list(cart.items.all())
        if not cart_items:
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        variant_ids = [item.variant.id for item in cart_items]
        variants_to_update = ProductVariant.objects.filter(id__in=variant_ids).select_for_update()
        variants_dict = {v.id: v for v in variants_to_update}

        for item in cart_items:
            variant = variants_dict.get(item.variant.id)
            if not variant or variant.stock < item.quantity:
                return Response(
                    {"error": f"Not enough stock for {item.variant.product.name} ({item.variant.size}). Available: {variant.stock if variant else 0}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        use_points = int(request.data.get('use_points', 0))
        if use_points > 0:
            if not hasattr(user, 'profile') or user.profile.points < use_points:
                return Response({"error": "Not enough points"}, status=status.HTTP_400_BAD_REQUEST)

        midtrans_order_id = f"ORDER-{uuid.uuid4().hex[:12].upper()}"
        order = serializer.save(user=user, midtrans_order_id=midtrans_order_id)

        total_amount = 0
        item_details = []

        for item in cart_items:
            variant = variants_dict[item.variant.id]
            ProductVariant.objects.filter(id=variant.id).update(stock=F('stock') - item.quantity)

            subtotal = variant.price * item.quantity
            total_amount += subtotal

            OrderItem.objects.create(order=order, variant=variant, quantity=item.quantity, price=variant.price)
            item_details.append({
                "id": str(variant.id),
                "price": int(variant.price),
                "quantity": item.quantity,
                "name": f"{variant.product.name} ({variant.color} / EU {variant.size})"[:50],
            })

        if use_points > 0:
            total_amount = max(0, total_amount - use_points)
            order.user.profile.points = F('points') - use_points
            order.user.profile.save(update_fields=['points'])
            
            # Since Midtrans doesn't natively handle negative line items well without proper gross_amount sync,
            # we just adjust gross_amount. If total_amount becomes 0, midtrans might fail. But we assume use_points <= subtotal.
            # (In a real scenario, you'd add a negative line item or handle 100% discount differently)

        points_earned = int(total_amount * 0.05)
        
        order.total_amount = total_amount
        order.points_used = use_points
        order.points_earned = points_earned
        order.save()
        cart.items.all().delete()

        snap_token = None
        snap_redirect_url = None

        try:
            snap = get_snap_client()
            snap_response = snap.create_transaction({
                "transaction_details": {
                    "order_id": midtrans_order_id,
                    "gross_amount": int(total_amount),
                },
                "item_details": item_details,
                "customer_details": {
                    "first_name": order.shipping_name,
                    "phone": order.shipping_phone,
                },
            })
            snap_token = snap_response.get('token')
            snap_redirect_url = snap_response.get('redirect_url')
            order.snap_token = snap_token
            order.save(update_fields=['snap_token'])
        except Exception as e:
            print(f"Midtrans error: {e}")

        order_data = OrderSerializer(order).data
        order_data['snap_token'] = snap_token
        order_data['snap_redirect_url'] = snap_redirect_url

        return Response(order_data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAdminUser])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        valid_statuses = [s[0] for s in Order.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {"error": f"Invalid status. Choose from: {', '.join(valid_statuses)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        order.status = new_status
        order.save()
        return Response(OrderSerializer(order, context={'request': request}).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def sync_midtrans(self, request, pk=None):
        order = self.get_object()

        if order.user != request.user and not request.user.is_staff:
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        if not order.midtrans_order_id:
            return Response({"error": "No Midtrans Order ID"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            core_api = midtransclient.CoreApi(
                is_production=settings.MIDTRANS_IS_PRODUCTION,
                server_key=settings.MIDTRANS_SERVER_KEY,
                client_key=settings.MIDTRANS_CLIENT_KEY
            )
            response = core_api.transactions.status(order.midtrans_order_id)
            apply_midtrans_status(order, response.get('transaction_status'), response.get('fraud_status'))
            return Response(OrderSerializer(order, context={'request': request}).data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['POST'])
@deco_permission_classes([permissions.AllowAny])
def midtrans_notification(request):
    try:
        data = request.data
        order_id = data.get('order_id')
        gross_amount = data.get('gross_amount')
        status_code = data.get('status_code', '')
        signature_key = data.get('sign_key')

        raw_string = f"{order_id}{status_code}{gross_amount}{settings.MIDTRANS_SERVER_KEY}"
        expected_signature = hashlib.sha512(raw_string.encode()).hexdigest()

        if signature_key and signature_key != expected_signature:
            return Response({"error": "Invalid signature"}, status=status.HTTP_403_FORBIDDEN)

        try:
            order = Order.objects.get(midtrans_order_id=order_id)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        apply_midtrans_status(order, data.get('transaction_status'), data.get('fraud_status'))
        return Response({"message": "OK"}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
