from rest_framework.routers import DefaultRouter

from .viewsets.auth import AuthViewSet

router = DefaultRouter()

router.register(r"auth", AuthViewSet, basename="auth")

urlpatterns = router.urls   