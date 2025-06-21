from django.db import models
from core.models import User
from .file import File

class ProjectStatus(models.TextChoices):
    DRAFT = 'draft'
    PUBLISHED = 'published'
    IN_PROGRESS = 'in_progress'
    FAILED = 'failed'
    ARCHIVED = 'archived'

class Project(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    files = models.ManyToManyField(File, related_name='projects', blank=True)
    status = models.CharField(max_length=255, choices=ProjectStatus.choices, default=ProjectStatus.DRAFT)
    is_deleted = models.BooleanField(default=False) #type: ignore
    is_archived = models.BooleanField(default=False) #type: ignore
    is_pinned = models.BooleanField(default=False) #type: ignore
    is_favorite = models.BooleanField(default=False) #type: ignore
    is_shared = models.BooleanField(default=False) #type: ignore

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-created_at']