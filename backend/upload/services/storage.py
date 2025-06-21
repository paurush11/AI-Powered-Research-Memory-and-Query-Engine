import hashlib
from django.core.files.storage import default_storage
from storages.backends.s3boto3 import S3Boto3Storage
from django.conf import settings
from urllib.parse import urljoin
import os
from django.http import Http404
from django.conf import settings
from django.http import FileResponse

def upload_to_storage(uploaded_file, user_id):
    path = f"uploads/{user_id}/{uploaded_file.name}"
    file_hash = hashlib.md5(uploaded_file.read()).hexdigest()
    uploaded_file.seek(0)  # reset pointer

    saved_path = default_storage.save(path, uploaded_file)
    file_url = default_storage.url(saved_path)

    return {
        "path": saved_path,
        "url": file_url,
        "hash": file_hash,
    }

def download_file_locally(file_instance):
    file_path = os.path.join(settings.MEDIA_ROOT, file_instance.file_path)
    if not os.path.exists(file_path):
        raise Http404("File not found")
    return FileResponse(open(file_path, 'rb'), as_attachment=True, filename=file_instance.file_name)


def generate_download_url(file_instance):
    return file_instance.file_url
