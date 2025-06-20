from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        read_only_fields = ("id", "status", "created_at", "updated_at")
        fields = (
            "id",
            "original_name",
            "file",
            "mime_type",
            "size",
            "status",
            "created_at",
            "updated_at",
        ) 