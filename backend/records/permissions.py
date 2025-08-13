# records/permissions.py
from rest_framework.permissions import BasePermission

class IsVipOrOwner(BasePermission):
    
    def has_object_permission(self, request, view, obj):
        role = getattr(request.user, "role", 0)
        if role == 1:
            return True
        return obj.user_id == request.user.id
