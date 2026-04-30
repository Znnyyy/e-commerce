from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        
        # Handle avatar upload
        avatar = request.FILES.get('avatar')
        if avatar:
            # Ensure profile exists
            if not hasattr(user, 'profile'):
                from .models import UserProfile
                UserProfile.objects.create(user=user)
            user.profile.avatar = avatar
            user.profile.save()

        return super().patch(request, *args, **kwargs)

class UserListView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request):
        users = User.objects.order_by('-date_joined').values(
            'id', 'username', 'email', 'is_staff', 'is_superuser',
            'is_active', 'date_joined', 'last_login'
        )
        return Response(list(users))

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        is_active = request.data.get('is_active')
        if is_active is not None:
            user.is_active = is_active
            user.save()
        return Response({'id': user.id, 'is_active': user.is_active})
