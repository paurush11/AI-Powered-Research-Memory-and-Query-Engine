from django.db import models
from core.models import User

class File(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="files")
    file = models.FileField(upload_to="files/")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    file_type = models.CharField(max_length=255)
    file_size = models.BigIntegerField()
    file_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=255)
    file_extension = models.CharField(max_length=255)
    file_hash = models.CharField(max_length=255)
    file_url = models.CharField(max_length=255)
    file_status = models.CharField(max_length=255)
    file_metadata = models.JSONField(default=dict)
    file_tags = models.JSONField(default=list)
   
    def __str__(self):
        return self.file.name 
    