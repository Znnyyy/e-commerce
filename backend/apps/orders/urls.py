from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, midtrans_notification

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
    path('orders/midtrans-notification/', midtrans_notification, name='midtrans_notification'),
]
