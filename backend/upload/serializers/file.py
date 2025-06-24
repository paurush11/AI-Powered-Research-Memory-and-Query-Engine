from rest_framework import serializers
from upload.models import File, FileStatus

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        # Include all fields so that the frontend receives the complete object
        fields = [
            'id',
            'user',
            'file',
            'created_at',
            'updated_at',
            'file_type',
            'file_size',
            'file_name',
            'file_path',
            'file_extension',
            'file_hash',
            'file_url',
            'file_status',
            'file_metadata',
            'file_tags',
        ]
        # All fields except 'file' should be read-only because they are filled in viewset
        read_only_fields = [
            'id',
            'user',
            'created_at',
            'updated_at',
            'file_type',
            'file_size',
            'file_name',
            'file_path',
            'file_extension',
            'file_hash',
            'file_url',
            'file_status',
            'file_metadata',
            'file_tags',
        ]

class UpdateFileMetadataSerializer(serializers.Serializer):
    file_name = serializers.CharField(required=False)
    file_metadata = serializers.JSONField(required=False)
    file_tags = serializers.ListField(child=serializers.CharField(), required=False)

    def validate_file_name(self, value):
        if value and len(value) > 255:
            raise serializers.ValidationError("File name must be less than 255 characters")
        return value
    
    def validate_file_metadata(self, value):
        if value and not isinstance(value, dict):
            raise serializers.ValidationError("File metadata must be a dictionary")
        return value
    
    def validate_file_tags(self, value):
        if value and not isinstance(value, list):
            raise serializers.ValidationError("File tags must be a list")
        return value

class UpdateFileStatusSerializer(serializers.Serializer):
    file_status = serializers.ChoiceField(choices=FileStatus.choices)

    def validate_file_status(self, value):
        if value not in FileStatus.values:
            raise serializers.ValidationError("Invalid file status")
        return value

class BulkUpdateFileMetadataSerializer(serializers.Serializer):
    file_ids = serializers.ListField(child=serializers.UUIDField())
    file_status = serializers.ChoiceField(choices=FileStatus.choices)
    number_of_files = serializers.IntegerField(min_value=1, max_value=1000)

    def validate_number_of_files(self, value):
        if value <= 0:
            raise serializers.ValidationError("Number of files must be greater than 0")
        if value > 1000:
            raise serializers.ValidationError("Cannot update more than 1000 files at once")
        return value

    def validate_file_ids(self, value):
        if len(value) != File.objects.filter(id__in=value).count(): #type: ignore
            raise serializers.ValidationError("Number of files must match the number of file IDs")
        return value
    
    def validate_file_status(self, value):
        if value not in FileStatus.values:
            raise serializers.ValidationError("Invalid file status")
        return value