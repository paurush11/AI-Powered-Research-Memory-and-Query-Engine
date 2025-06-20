import uuid
from django.db import models
from django.utils import timezone
from upload.models import Document

class Job(models.Model):
    class Type(models.TextChoices):
        PARSE = "parse", "Parse"
        EMBED = "embed", "Embed"
        STATS = "stats", "Stats"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        RUNNING = "running", "Running"
        DONE = "done", "Done"
        ERROR = "error", "Error"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doc = models.ForeignKey(Document, related_name="jobs", null=True, on_delete=models.CASCADE)
    job_type = models.CharField(max_length=20, choices=Type.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    progress = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    error_msg = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    def mark_running(self):
        self.status = self.Status.RUNNING
        self.started_at = timezone.now()
        self.save(update_fields=["status", "started_at"])

    def mark_done(self):
        self.status = self.Status.DONE
        self.progress = 100
        self.finished_at = timezone.now()
        self.save(update_fields=["status", "progress", "finished_at"])

    def mark_error(self, msg: str):
        self.status = self.Status.ERROR
        self.error_msg = msg
        self.finished_at = timezone.now()
        self.save(update_fields=["status", "error_msg", "finished_at"]) 