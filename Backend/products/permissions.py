from rest_framework import permissions

class IsSellerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True  # anyone can view
        return request.user.is_authenticated and request.user.is_seller

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user  # only the owner can edit/delete their product