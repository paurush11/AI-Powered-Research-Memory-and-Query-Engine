from rest_framework.routers import DefaultRouter
from .viewsets import FileViewSet

router = DefaultRouter()
router.register(r"files", FileViewSet, basename="file")

urlpatterns = router.urls 