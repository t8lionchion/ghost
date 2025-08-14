# accounts/permissions.py
from rest_framework.permissions import BasePermission

class IsVipOrOwner(BasePermission):
    """VIP (role=2) 可以存取全部；否則僅能存取自己的"""
    def has_object_permission(self, request, view, obj):
        role = getattr(request.user, "role", 0)
        if role == 2:   # VIP
            return True
        return getattr(obj, "user_id", None) == getattr(request.user, "id", None)


class IsAdminOrOwner(BasePermission):
    """Admin (role=3) 可以存取全部；否則僅能存取自己的"""
    def has_object_permission(self, request, view, obj):
        role = getattr(request.user, "role", 0)
        if role == 3:   # Admin
            return True
        return getattr(obj, "user_id", None) == getattr(request.user, "id", None)
