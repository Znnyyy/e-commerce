from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer
from .permissions import IsSuperAdmin

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
        
        avatar = request.FILES.get('avatar') or request.data.get('avatar')
        if avatar:
            if not hasattr(user, 'profile'):
                from .models import UserProfile
                UserProfile.objects.create(user=user)
            user.profile.avatar = avatar
            user.profile.save()

        return super().patch(request, *args, **kwargs)

class UserListView(APIView):
    permission_classes = (IsSuperAdmin,)

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
            
        role = request.data.get('role')
        if role:
            if user == request.user and role != 'superadmin':
                return Response({'error': 'Cannot downgrade your own superadmin role'}, status=400)
                
            if role == 'superadmin':
                user.is_staff = True
                user.is_superuser = True
            elif role == 'staff' or role == 'admin':
                user.is_staff = True
                user.is_superuser = False
            elif role == 'customer' or role == 'user':
                user.is_staff = False
                user.is_superuser = False

        user.save()
        return Response({
            'id': user.id, 
            'is_active': user.is_active,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser
        })
