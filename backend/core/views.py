from rest_framework import viewsets, permissions
from core.models import User
from core.serializers import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    """Read-only access to users; create allowed for admin only."""

    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()] 