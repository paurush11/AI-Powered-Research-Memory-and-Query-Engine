import os
from pathlib import Path
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-change-me")
DEBUG = os.getenv("DEBUG", "True") == "True"
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "*").split(",")

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "storages",
    "rest_framework",
    "corsheaders",          # CORS handling
    "django_filters",       # DRF filtering
    "django_extensions",    # shell_plus etc.
    "guardian",             # object-level permissions
    "axes",                 # brute-force protection
    "debug_toolbar",        # dev toolbar
    "drf_yasg",             # Swagger / OpenAPI docs
    "django_celery_results",
    "django_celery_beat",
    "core",
    "upload",
    "jobs",
    "chat",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    # Third-party middleware
    "axes.middleware.AxesMiddleware",
    "debug_toolbar.middleware.DebugToolbarMiddleware",
]

ROOT_URLCONF = "project_root.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "project_root.wsgi:application"

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/research_memory")
url = urlparse(DATABASE_URL)

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": url.path[1:],
        "USER": url.username,
        "PASSWORD": url.password,
        "HOST": url.hostname,
        "PORT": url.port or "5432",
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static & media
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ----------------------------------------------------------------------------
# File storage – Amazon S3 / Google Cloud Storage / Azure Blob via django-storages
# ----------------------------------------------------------------------------

# Select backend via STORAGE_BACKEND env variable: "aws", "gcp", "azure", or
# leave unset/"local" to use default FileSystemStorage.

STORAGE_BACKEND = os.getenv("STORAGE_BACKEND", "local").lower()

if STORAGE_BACKEND == "aws":
    DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"

    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_STORAGE_BUCKET_NAME = os.getenv("AWS_STORAGE_BUCKET_NAME")
    AWS_S3_REGION_NAME = os.getenv("AWS_S3_REGION_NAME", "us-east-1")
    AWS_QUERYSTRING_AUTH = os.getenv("AWS_QUERYSTRING_AUTH", "False") == "True"

elif STORAGE_BACKEND == "gcp":
    DEFAULT_FILE_STORAGE = "storages.backends.gcloud.GoogleCloudStorage"
    GS_BUCKET_NAME = os.getenv("GS_BUCKET_NAME")
    GS_PROJECT_ID = os.getenv("GS_PROJECT_ID")
    GS_CREDENTIALS_FILE = os.getenv("GS_CREDENTIALS_FILE")
    if GS_CREDENTIALS_FILE:
        try:
            from google.oauth2 import service_account  # noqa: WPS433 (runtime import)

            GS_CREDENTIALS = service_account.Credentials.from_service_account_file(
                GS_CREDENTIALS_FILE,
            )
        except ModuleNotFoundError:
            # google-cloud-storage not installed – will raise at runtime if used
            GS_CREDENTIALS = None

elif STORAGE_BACKEND == "azure":
    DEFAULT_FILE_STORAGE = "storages.backends.azure_storage.AzureStorage"

    AZURE_ACCOUNT_NAME = os.getenv("AZURE_ACCOUNT_NAME")
    AZURE_ACCOUNT_KEY = os.getenv("AZURE_ACCOUNT_KEY")
    AZURE_CONTAINER = os.getenv("AZURE_CONTAINER")


# REST framework defaults
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
}

# Celery
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", CELERY_BROKER_URL)
CELERY_ACCEPT_CONTENT = ["application/json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = TIME_ZONE

# DuckDB
DUCKDB_FILE = os.getenv("DUCKDB_FILE", str(BASE_DIR / "analytics.duckdb"))

# Authentication backends (enable django-guardian object permissions & Axes)
AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "guardian.backends.ObjectPermissionBackend",
    "axes.backends.AxesBackend",
]

# CORS – allow all origins in dev; tighten in prod
CORS_ALLOW_ALL_ORIGINS = DEBUG
# Debug toolbar – show only to localhost
INTERNAL_IPS = [
    "127.0.0.1",
]
# Django-Guardian settings
ANONYMOUS_USER_NAME = "anonymous"
# Custom user model
AUTH_USER_MODEL = "core.User" 