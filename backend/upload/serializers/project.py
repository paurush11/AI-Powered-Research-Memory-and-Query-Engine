from rest_framework import serializers
from upload.models import Project, ProjectStatus
from core.models import User

class ProjectSerializer(serializers.ModelSerializer):
    # Accept user_id in the payload; map it to the related user
    user_id = serializers.PrimaryKeyRelatedField(source='user', queryset=User.objects.all(), write_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'user_id', 'user', 'status', 
            'is_deleted', 'is_pinned', 'is_favorite', 'is_shared',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class BulkProjectSerializer(serializers.Serializer):
    user_id = serializers.PrimaryKeyRelatedField(source='user', queryset=User.objects.all(), write_only=True)
    number_of_projects = serializers.IntegerField(min_value=1, max_value=1000)
    name = serializers.CharField(max_length=255)
    description = serializers.CharField(max_length=255, required=False, allow_blank=True)
    status = serializers.ChoiceField(choices=ProjectStatus.choices, default=ProjectStatus.DRAFT)


    def validate_number_of_projects(self, value):
        if value <= 0:
            raise serializers.ValidationError("Number of projects must be greater than 0")
        if value > 100:
            raise serializers.ValidationError("Cannot create more than 100 projects at once")
        return value

  