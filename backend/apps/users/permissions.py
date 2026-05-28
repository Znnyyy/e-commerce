from rest_framework import permissions

class IsSuperAdmin(permissions.BasePermission):
    """
    Allows access only to superadmin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)

class IsAdminOrSuperAdmin(permissions.BasePermission):
    """
    Allows access only to staff (Admin) or superadmin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)

class ProductAccessPermission(permissions.BasePermission):
    """
    Custom permission for products/variants/images:
    - GET: Anyone (AllowAny)
    - PUT/PATCH: Staff or Superadmin
    - POST/DELETE: Superadmin only
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if not request.user or not request.user.is_authenticated:
            return False
            
        if request.method in ['PUT', 'PATCH']:
            return request.user.is_staff # Both admin and superadmin
            
        if request.method in ['POST', 'DELETE']:
            return request.user.is_superuser
            
        return False

class ReviewAccessPermission(permissions.BasePermission):
    """
    Custom permission for reviews:
    - GET: Anyone
    - POST: Authenticated users
    - DELETE/PUT/PATCH: Staff or Superadmin
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
            
        if not request.user or not request.user.is_authenticated:
            return False
            
        if request.method == 'POST':
            return True # Any authenticated user can POST (further logic in view)
            
        return request.user.is_staff
