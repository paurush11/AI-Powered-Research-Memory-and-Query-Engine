from __future__ import absolute_import, unicode_literals

import os
from celery import Celery, signals
from django.conf import settings
import logging
logger = logging.getLogger(__name__)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "project_root.settings")

app = Celery("research_memory")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

app.conf.update(
    broker_connection_retry_on_startup=True,
    worker_prefetch_multiplier=1,
    task_track_started=True,
    task_time_limit=30 * 60,
)

app.conf.task_routes = {
    "jobs.tasks.*": {"queue": "jobs_tasks"},
    "upload.tasks.*": {"queue": "upload_tasks"},
    "chat.tasks.*": {"queue": "chat_tasks"},
    "core.tasks.*": {"queue": "core_tasks"},
}


@signals.task_failure.connect
@signals.task_internal_error.connect
def task_failure_handler(**kwargs):
    sender = kwargs.get('sender')
    task_id = kwargs.get('task_id')
    exception = kwargs.get('exception')
    traceback = kwargs.get('traceback')
    exe_info = (type(exception), exception, traceback)
    logger.error(
        f"Task {sender} with ID {task_id} failed with exception: {exception}",
        exe_info=exe_info,
        extra={
            "data":{
                "task_id": task_id,
                "sender": sender,
                "exception": exception,
                "traceback": traceback
            }
        }
        
    )

@app.task(bind=True)
def debug_task(self):
    print(f"Request: {self.request!r}") 