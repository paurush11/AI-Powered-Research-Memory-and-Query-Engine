from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter
from upload.models import Project, ProjectStatus, File, FileStatus
from upload.serializers.file import FileSerializer
from upload.serializers.project import ProjectSerializer, BulkProjectSerializer
from upload.filters import ProjectFilterSet
import logging
from django.conf import settings
from typing import Dict, Any, List
from django.utils.text import slugify
import uuid

logger = logging.getLogger(__name__)

class ProjectViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user Projects"""
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_class = ProjectFilterSet
    ordering_fields = ['created_at', 'updated_at', 'name']
    search_fields = ['name', 'description']

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user, is_deleted=False) #type: ignore

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
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

    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        """Update the status of a project draft to archive or published"""
        project = self.get_object()
        try:
            new_status = ProjectStatus(request.data.get('status'))
        except ValueError:
            return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
        
        ALLOWED_TRANSITIONS = {
            ProjectStatus.DRAFT: {ProjectStatus.ARCHIVED, ProjectStatus.PUBLISHED},
            ProjectStatus.ARCHIVED: {ProjectStatus.DRAFT},
            ProjectStatus.PUBLISHED: {ProjectStatus.DRAFT}
        }
        
        current_status = project.status
        allowed_next_statuses = ALLOWED_TRANSITIONS.get(current_status, set())
        
        if new_status not in allowed_next_statuses:
            return Response(
                {"error": f"Cannot transition from {current_status} to {new_status}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        project.status = new_status
        project.save()
        serializer = self.get_serializer(project)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Bulk create projects in bulk"""
        serializer = BulkProjectSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        validated_data: Dict[str, Any] = serializer.validated_data  # type: ignore[assignment]
        base_name = validated_data.get('name', '')  # type: ignore
        description = validated_data.get('description', '')  # type: ignore
        project_status = validated_data.get('status', ProjectStatus.DRAFT)  # type: ignore
        number_of_projects = validated_data.get('number_of_projects', 1)  # type: ignore
        
        projects = [
            Project(  # type: ignore
                user=user,
                name=f"{base_name}_{i}" if number_of_projects > 1 else base_name,
                description=description,
                status=project_status,
                slug=slugify(f"{base_name}_{i}-{uuid.uuid4().hex[:8]}" if number_of_projects > 1 else f"{base_name}-{uuid.uuid4().hex[:8]}")
            )
            for i in range(1, number_of_projects + 1)
        ]
        
        Project.objects.bulk_create(projects)  # type: ignore[attr-defined]
        return Response(status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='attach-file')
    def attach_file(self, request, pk=None):
        """Attach a file to a project"""
        project = self.get_object()
        file_id = request.data.get('file_id')

        if not file_id:
            return Response({"error": "File ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            file = File.objects.get(id=file_id)
        except File.DoesNotExist:
            return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if file.file_status == FileStatus.PENDING :
            return Response({"error": "File is pending"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            file.file_status = FileStatus.DRAFT
            file.save()
        
        project.files.add(file) #type: ignore
        project.save()
        return Response(status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='detach-file')
    def detach_file(self, request, pk=None):
        """Detach a file from a project"""
        project = self.get_object()
        file_id = request.data.get('file_id')
        
        if not file_id:
            return Response({"error": "File ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            file = File.objects.get(id=file_id)
        except File.DoesNotExist:
            return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)

        project.files.remove(file)
        project.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], url_path='bulk-attach-files')
    def bulk_attach_files(self, request, pk=None):
        """Bulk attach files to a project"""
        project = self.get_object()
        file_ids = request.data.get('file_ids', [])
        status = request.data.get('status')

        if not file_ids:
            return Response({"error": "File IDs are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        is_any_file_pending = False
        for file_id in file_ids:
            try:
                file = File.objects.get(id=file_id) #type: ignore
            except Exception as e:
                return Response({"error": f"File not found: {e}"}, status=status.HTTP_404_NOT_FOUND)
            
            if file.file_status == FileStatus.PENDING:
                is_any_file_pending = True
        
        if is_any_file_pending:
            return Response({"error": "One or more files are pending"}, status=status.HTTP_400_BAD_REQUEST)
        
        files = list(File.objects.filter(id__in=file_ids)) #type: ignore
        for file in files:
            file.file_status = FileStatus.DRAFT
        File.objects.bulk_update(files, ['file_status'], batch_size=settings.BULK_UPDATE_OR_CREATE_BATCH_SIZE) #type: ignore
        project.files.add(*files) #type: ignore
        project.save()
    
        return Response(status=status.HTTP_200_OK)
        
    @action(detail=True, methods=['post'], url_path='bulk-detach-files')
    def bulk_detach_files(self, request, pk=None):
        """Bulk detach files from a project"""
        project = self.get_object()
        file_ids = request.data.get('file_ids', [])
        if not file_ids:
            return Response({"error": "File IDs are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        files = list(File.objects.filter(id__in=file_ids)) #type: ignore
        project.files.remove(*files) #type: ignore
        project.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'], url_path='files')
    def files(self, request, pk=None):
        """Get all files for a project"""
        project = self.get_object()
        project_files = project.files.all()
        serializer = FileSerializer(project_files, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def get_project_details(self, request, pk=None):
        """Get the details of a project"""
        project = self.get_object()
        serializer = ProjectSerializer(project)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='bulk-delete')
    def bulk_delete(self, request):
        """Soft-delete a list of projects belonging to the current user."""
        project_ids = request.data.get('project_ids', [])
        if not project_ids:
            return Response({"error": "No project IDs provided"}, status=status.HTTP_400_BAD_REQUEST)
        projects = list(Project.objects.filter(id__in=project_ids, user=request.user))  # type: ignore[attr-defined]
        if not projects:
            return Response({"error": "No projects found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Update all projects in memory
        for project in projects:
            project.is_deleted = True  # type: ignore

        Project.objects.bulk_update(projects, ['is_deleted'], batch_size=settings.BULK_UPDATE_OR_CREATE_BATCH_SIZE)  # type: ignore[arg-type]
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'], url_path='bulk-update')
    def bulk_update(self, request):
        """Update a list of projects in bulk."""
        project_ids = request.data.get('project_ids', [])
        action = request.data.get('action', 'update-status')
        action_value = bool(request.data.get('action_value', True))
        new_status = request.data.get('status')
        if not project_ids:
            return Response({"error": "No project IDs provided"}, status=status.HTTP_400_BAD_REQUEST)
        projects = list(Project.objects.filter(id__in=project_ids, user=request.user))  # type: ignore[attr-defined]
        if not projects:
            return Response({"error": "No projects found"}, status=status.HTTP_404_NOT_FOUND)
        ACTION_FIELD_MAPPING = {
            'delete': 'is_deleted',
            'pinned': 'is_pinned', 
            'favorite': 'is_favorite',
            'shared': 'is_shared',
        }
        
        fields_to_update = set()

        if action in ACTION_FIELD_MAPPING:
            field_name = ACTION_FIELD_MAPPING[action]
            for project in projects:
                setattr(project, field_name, action_value)  # type: ignore
            fields_to_update.add(field_name)
            
        elif action == 'update-status' and new_status:
            try:
                new_status_enum = ProjectStatus(new_status)
                for project in projects:
                    project.status = new_status_enum  # type: ignore
                fields_to_update.add('status')
            except ValueError:
                return Response(
                    {"error": f"Invalid status value: {new_status}"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if not fields_to_update:
            return Response(
                {"error": "No valid fields to update"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            updated_count = Project.objects.bulk_update(  # type: ignore[attr-defined,arg-type]
                projects,
                list(fields_to_update),
                batch_size=settings.BULK_UPDATE_OR_CREATE_BATCH_SIZE,
            )

        except Exception as e:
            logger.error(f"Error updating projects: {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_204_NO_CONTENT)


    