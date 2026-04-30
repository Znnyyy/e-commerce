from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes as deco_permission_classes
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import Sum, Count
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .models import Order, OrderItem
from .serializers import OrderSerializer
from apps.cart.models import Cart
from apps.shop.models import ProductVariant
import midtransclient
import uuid
import hashlib
import json


def get_snap_client():
    return midtransclient.Snap(
        is_production=settings.MIDTRANS_IS_PRODUCTION,
        server_key=settings.MIDTRANS_SERVER_KEY,
        client_key=settings.MIDTRANS_CLIENT_KEY,
    )


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
        from django.contrib.auth.models import User
        from django.db.models.functions import TruncMonth
        import datetime

        total_orders = Order.objects.count()
        total_revenue = Order.objects.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        recent_orders = Order.objects.order_by('-created_at')[:5]

        twelve_months_ago = datetime.date.today().replace(day=1) - datetime.timedelta(days=365)
        monthly_data = (
            Order.objects
            .filter(created_at__date__gte=twelve_months_ago)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(revenue=Sum('total_amount'), count=Count('id'))
            .order_by('month')
        )
        monthly_chart = [
            {
                'month': entry['month'].strftime('%b %Y'),
                'revenue': float(entry['revenue'] or 0),
                'orders': entry['count'],
            }
            for entry in monthly_data
        ]

        status_data = Order.objects.values('status').annotate(count=Count('id'))
        status_chart = [{'status': s['status'], 'count': s['count']} for s in status_data]

        top_products = (
            OrderItem.objects
            .values('variant__product__name')
            .annotate(total_qty=Sum('quantity'))
            .order_by('-total_qty')[:5]
        )
        top_products_chart = [
            {'name': p['variant__product__name'], 'qty': p['total_qty']}
            for p in top_products
        ]

        users = User.objects.order_by('-date_joined').values(
            'id', 'username', 'email', 'is_staff', 'is_active', 'date_joined'
        )

        from apps.shop.models import Product
        total_products = Product.objects.count()
        total_users = User.objects.filter(is_staff=False).count()

        return Response({
            'total_orders': total_orders,
            'total_revenue': total_revenue,
            'total_products': total_products,
            'total_users': total_users,
            'recent_orders': OrderSerializer(recent_orders, many=True).data,
            'monthly_chart': monthly_chart,
            'status_chart': status_chart,
            'top_products': top_products_chart,
            'users': list(users),
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

        for item in cart_items:
            if item.variant.stock < item.quantity:
                return Response(
                    {"error": f"Not enough stock for {item.variant.product.name} ({item.variant.size}). Available: {item.variant.stock}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Buat unique order ID untuk Midtrans
        midtrans_order_id = f"ORDER-{uuid.uuid4().hex[:12].upper()}"

        order = serializer.save(user=user, midtrans_order_id=midtrans_order_id)
        total_amount = 0
        item_details = []

        for item in cart_items:
            variant = item.variant
            variant.stock -= item.quantity
            variant.save()

            price = variant.price
            subtotal = price * item.quantity
            total_amount += subtotal

            OrderItem.objects.create(
                order=order,
                variant=variant,
                quantity=item.quantity,
                price=price
            )

            item_details.append({
                "id": str(variant.id),
                "price": int(price),
                "quantity": item.quantity,
                "name": f"{variant.product.name} ({variant.color} / EU {variant.size})"[:50],
            })

        order.total_amount = total_amount
        order.save()

        # Clear cart
        cart.items.all().delete()

        # Request Snap Token ke Midtrans
        try:
            snap = get_snap_client()
            snap_params = {
                "transaction_details": {
                    "order_id": midtrans_order_id,
                    "gross_amount": int(total_amount),
                },
                "item_details": item_details,
                "customer_details": {
                    "first_name": order.shipping_name,
                    "phone": order.shipping_phone,
                },
            }
            snap_response = snap.create_transaction(snap_params)
            snap_token = snap_response.get('token')
            snap_redirect_url = snap_response.get('redirect_url')

            order.snap_token = snap_token
            order.save(update_fields=['snap_token'])

        except Exception as e:
            # Jika Midtrans gagal, order tetap tersimpan tapi tanpa token
            snap_token = None
            snap_redirect_url = None
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

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def sync_midtrans(self, request, pk=None):
        order = self.get_object()
        if not order.midtrans_order_id:
            return Response({"error": "No Midtrans Order ID for this order"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            core_api = midtransclient.CoreApi(
                is_production=settings.MIDTRANS_IS_PRODUCTION,
                server_key=settings.MIDTRANS_SERVER_KEY,
                client_key=settings.MIDTRANS_CLIENT_KEY
            )
            response = core_api.transactions.status(order.midtrans_order_id)
            
            transaction_status = response.get('transaction_status')
            fraud_status = response.get('fraud_status')
            
            old_status = order.status

            if transaction_status == 'capture':
                order.status = 'paid' if fraud_status == 'accept' else 'pending'
            elif transaction_status == 'settlement':
                order.status = 'paid'
            elif transaction_status in ('cancel', 'deny', 'expire'):
                order.status = 'failed'
                # Rollback stock if status was pending and now failed
                if old_status == 'pending':
                    for item in order.items.all():
                        if item.variant:
                            item.variant.stock += item.quantity
                            item.variant.save()
            elif transaction_status == 'pending':
                order.status = 'pending'
            
            order.save(update_fields=['status'])
            return Response(OrderSerializer(order, context={'request': request}).data)

        except Exception as e:
            # Jika transaksi tidak ditemukan di midtrans, mungkin belum di-pay atau error
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['POST'])
@deco_permission_classes([permissions.AllowAny])
def midtrans_notification(request):
    """
    Webhook endpoint dari Midtrans.
    Midtrans akan POST ke sini setelah ada perubahan status transaksi.
    """
    try:
        data = request.data
        order_id = data.get('order_id')
        transaction_status = data.get('transaction_status')
        fraud_status = data.get('fraud_status')
        gross_amount = data.get('gross_amount')
        signature_key = data.get('sign_key')

        # Verifikasi signature untuk keamanan
        server_key = settings.MIDTRANS_SERVER_KEY
        status_code = data.get('status_code', '')
        raw_string = f"{order_id}{status_code}{gross_amount}{server_key}"
        expected_signature = hashlib.sha512(raw_string.encode()).hexdigest()

        if signature_key and signature_key != expected_signature:
            return Response({"error": "Invalid signature"}, status=status.HTTP_403_FORBIDDEN)

        try:
            order = Order.objects.get(midtrans_order_id=order_id)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        # Update status berdasarkan notifikasi Midtrans
        if transaction_status == 'capture':
            order.status = 'paid' if fraud_status == 'accept' else 'pending'
        elif transaction_status == 'settlement':
            order.status = 'paid'
        elif transaction_status in ('cancel', 'deny', 'expire'):
            order.status = 'failed'
            # Rollback stock
            for item in order.items.all():
                if item.variant:
                    item.variant.stock += item.quantity
                    item.variant.save()
        elif transaction_status == 'pending':
            order.status = 'pending'

        order.save(update_fields=['status'])
        return Response({"message": "OK"}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
