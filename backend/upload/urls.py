from rest_framework.routers import DefaultRouter
from .viewsets import FileViewSet
from .viewsets.project import ProjectViewSet

router = DefaultRouter()
router.register(r"files", FileViewSet, basename="file")
router.register(r"projects", ProjectViewSet, basename="project")

urlpatterns = router.urls 