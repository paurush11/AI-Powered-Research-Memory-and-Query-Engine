from django.db import models
from django.utils.text import slugify
from core.models import User
import uuid

class FileStatus(models.TextChoices):
    PROCESSED = 'processed'
    PENDING = 'pending'
    FAILED = 'failed'
    DRAFT = 'draft'

class File(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="files")
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to="files/")
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    file_type = models.CharField(max_length=255)
    file_size = models.BigIntegerField()
    file_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=255)
    file_extension = models.CharField(max_length=255)
    file_hash = models.CharField(max_length=255)
    file_url = models.CharField(max_length=255)
    file_status = models.CharField(max_length=255, choices=FileStatus.choices, default=FileStatus.DRAFT)
    file_metadata = models.JSONField(default=dict)
    file_tags = models.JSONField(default=list)
   
    def __str__(self):
        return self.file.name 
    
    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.file_name or self.file.name)
            unique_suffix = str(self.id)[:8]
            self.slug = f"{base_slug}-{unique_suffix}"
        
        super().save(*args, **kwargs)
    