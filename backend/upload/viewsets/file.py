from rest_framework import viewsets, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from upload.models import File, FileStatus
from upload.serializers import FileSerializer
from upload.services import upload_to_storage, generate_download_url, download_file_locally
import os
from django.conf import settings
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action
from upload.serializers.file import UpdateFileMetadataSerializer, UpdateFileStatusSerializer

class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all() #type: ignore
    serializer_class = FileSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        uploaded_file = serializer.validated_data['file']
        user = request.user
        # Generate file metadata
        file_name = uploaded_file.name
        file_extension = os.path.splitext(file_name)[1].lower()
        file_size = uploaded_file.size

        # Save to provider (local, S3, etc.)
        upload_result = upload_to_storage(uploaded_file, user.id)
        file_type = getattr(uploaded_file, 'content_type', '') or os.path.splitext(file_name)[1].lower().lstrip('.')

        # We are manually creating the instance, so we call save on the instance, not the serializer
        instance = serializer.save(
            user=user,
            file_name=file_name,
            file_size=file_size,
            file_extension=file_extension,
            file_path=upload_result['path'],
            file_url=upload_result['url'],
            file_status='uploaded',
            file_type=file_type,
            file_hash=upload_result['hash'],
        )
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='download')
    def download(self, request, pk=None):
        """Download the file"""
        instance = self.get_object()
        if settings.DEBUG:
            return download_file_locally(instance)
        else:
            url = generate_download_url(instance)
        return Response({"download_url": url})

    @action(detail=True, methods=['post'], url_path='update-file-metadata')
    def update_file_metadata(self, request, pk=None):
        """Update the metadata of a file"""
        instance = self.get_object()
        serializer = UpdateFileMetadataSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Update the instance with validated data
        validated_data = serializer.validated_data
        if 'file_name' in validated_data:
            instance.file_name = validated_data['file_name']
        if 'file_metadata' in validated_data:
            instance.file_metadata = validated_data['file_metadata']
        if 'file_tags' in validated_data:
            instance.file_tags = validated_data['file_tags']
        
        instance.save()
        
        # Return the updated file data
        response_serializer = FileSerializer(instance)
        return Response(response_serializer.data)

    @action(detail=True, methods=['post'], url_path='update-file-status')
    def update_file_status(self, request, pk=None):
        """Update the status of a file"""
        instance = self.get_object()
        serializer = UpdateFileStatusSerializer(instance, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        new_status = serializer.validated_data.get('file_status')
        ALLOWED_STATUS_TRANSITIONS = {
            FileStatus.DRAFT: [FileStatus.PENDING, FileStatus.PROCESSED],
            FileStatus.PENDING: [FileStatus.PROCESSED],
            FileStatus.PROCESSED: [FileStatus.DRAFT],
        }

        if new_status not in ALLOWED_STATUS_TRANSITIONS[instance.file_status]:
            return Response({"error": "Invalid status transition"}, status=status.HTTP_400_BAD_REQUEST)
        
        instance.file_status = new_status
        instance.save()
        return Response(serializer.data)

