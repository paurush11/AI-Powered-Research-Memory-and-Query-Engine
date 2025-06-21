from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter

from upload.models import Project, ProjectStatus
from upload.serializers.project import ProjectSerializer
from upload.filters import ProjectFilterSet

class ProjectViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user Projects"""
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_class = ProjectFilterSet
    ordering_fields = ['created_at', 'updated_at', 'name']
    search_fields = ['name', 'description']

    def get_queryset(self):
        # Return only projects belonging to the authenticated user and not deleted
        return Project.objects.filter(user=self.request.user, is_deleted=False) #type: ignore

    def perform_create(self, serializer):
        # Automatically set the user to the authenticated user
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        # Ensure only the owner can update the project
        serializer.save()

    def perform_destroy(self, instance):
        # Soft delete - mark as deleted instead of actually deleting
        instance.is_deleted = True
        instance.save()

    @action(detail=True, methods=['patch'], url_path='toggle-pin')
    def toggle_pin(self, request, pk=None):
        """Toggle the pinned status of a project"""
        project = self.get_object()
        project.is_pinned = not project.is_pinned
        project.save()
        
        serializer = self.get_serializer(project)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], url_path='toggle-favorite')
    def toggle_favorite(self, request, pk=None):
        """Toggle the favorite status of a project"""
        project = self.get_object()
        project.is_favorite = not project.is_favorite
        project.save()
        
        serializer = self.get_serializer(project)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], url_path='toggle-share')
    def toggle_share(self, request, pk=None):
        """Toggle the shared status of a project"""
        project = self.get_object()
        project.is_shared = not project.is_shared
        project.save()
        
        serializer = self.get_serializer(project)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def archive(self, request, pk=None):
        """Archive a project"""
        project = self.get_object()
        project.is_archived = True
        project.status = ProjectStatus.ARCHIVED
        project.save()
        
        serializer = self.get_serializer(project)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def unarchive(self, request, pk=None):
        """Unarchive a project"""
        project = self.get_object()
        project.is_archived = False
        project.status = ProjectStatus.DRAFT
        project.save()
        
        serializer = self.get_serializer(project)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def publish(self, request, pk=None):
        """Publish a project"""
        project = self.get_object()
        project.status = ProjectStatus.PUBLISHED
        project.save()
        
        serializer = self.get_serializer(project)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def unpublish(self, request, pk=None):
        """Unpublish a project (set back to draft)"""
        project = self.get_object()
        project.status = ProjectStatus.DRAFT
        project.save()
        
        serializer = self.get_serializer(project)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pinned(self, request):
        """Get all pinned projects for the user"""
        projects = self.get_queryset().filter(is_pinned=True)
        serializer = self.get_serializer(projects, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def favorites(self, request):
        """Get all favorite projects for the user"""
        projects = self.get_queryset().filter(is_favorite=True)
        serializer = self.get_serializer(projects, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def shared(self, request):
        """Get all shared projects for the user"""
        projects = self.get_queryset().filter(is_shared=True)
        serializer = self.get_serializer(projects, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def archived(self, request):
        """Get all archived projects for the user"""
        projects = self.get_queryset().filter(is_archived=True)
        serializer = self.get_serializer(projects, many=True)
        return Response(serializer.data)


    