from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from upload.models import File
from upload.serializers import FileSerializer
from upload.services import upload_to_storage, generate_download_url, download_file_locally
import os
from django.conf import settings

class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all() #type: ignore
    serializer_class = FileSerializer
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        uploaded_file = self.request.FILES['file'] #type: ignore
        user = self.request.user
        
        # Generate file metadata
        file_name = uploaded_file.name #type: ignore
        file_extension = os.path.splitext(file_name)[1].lower()
        file_size = uploaded_file.size #type: ignore

        # Save to provider (local, S3, etc.)
        upload_result = upload_to_storage(uploaded_file, user.id)

        serializer.save(
            user=user,
            file=uploaded_file,
            file_name=file_name,
            file_size=file_size,
            file_extension=file_extension,
            file_path=upload_result['path'],
            file_url=upload_result['url'],
            file_status='uploaded',
            file_metadata={},
            file_hash=upload_result.get('hash', ''),
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if settings.DEBUG:
            return download_file_locally(instance)
        else:
            url = generate_download_url(instance)
        return Response({"download_url": url})

