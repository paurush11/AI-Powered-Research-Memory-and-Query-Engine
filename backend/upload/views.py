import magic
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Document
from .serializers import DocumentSerializer


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all().order_by("-created_at")
    serializer_class = DocumentSerializer
    parser_classes = (MultiPartParser, FormParser)

    def perform_create(self, serializer):
        file_obj = self.request.FILES["file"]
        mime_type = magic.from_buffer(file_obj.read(2048), mime=True)
        file_obj.seek(0)
        serializer.save(
            owner=self.request.user if self.request.user.is_authenticated else None,
            original_name=file_obj.name,
            mime_type=mime_type,
            size=file_obj.size,
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.file.delete(save=False)
        return super().destroy(request, *args, **kwargs) 