from rest_framework import serializers
from upload.models import Project
from core.models import User

class ProjectSerializer(serializers.ModelSerializer):
    # Accept user_id in the payload; map it to the related user
    user_id = serializers.PrimaryKeyRelatedField(source='user', queryset=User.objects.all(), write_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'user_id', 'user', 'status', 
            'is_deleted', 'is_archived', 'is_pinned', 'is_favorite', 'is_shared',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']