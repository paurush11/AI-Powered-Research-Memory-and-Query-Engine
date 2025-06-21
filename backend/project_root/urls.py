from django.contrib import admin
from django.urls import include, path
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from upload.urls import router as upload_router
from core.urls import router as core_router
from jobs.urls import router as jobs_router
from chat.urls import router as chat_router

schema_view = get_schema_view(
    openapi.Info(
        title="Research Memory API",
        default_version="v1",
        description="API for Research Memory",
        contact=openapi.Contact(email="contact@researchmemory.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path("swagger<format>/", schema_view.without_ui(cache_timeout=0), name="schema-json"),
    path("swagger/", schema_view.with_ui("swagger", cache_timeout=0), name="schema-swagger-ui"),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
]

urlpatterns += upload_router.urls   
urlpatterns += core_router.urls
urlpatterns += jobs_router.urls
urlpatterns += chat_router.urls