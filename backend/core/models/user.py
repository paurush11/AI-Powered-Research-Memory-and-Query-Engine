import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django.utils import timezone
from .base import TimeStampedModel

class User(AbstractUser, TimeStampedModel):
    """Custom application user supporting classic and OAuth authentication.

    Changes from Django's default:
    • Primary key is a UUID.
    • Email is the unique login identifier (USERNAME_FIELD).
    • Username is optional so accounts coming from OAuth providers that do not
      supply a distinct username can still be created.
    • Extra profile fields are provided for richer user information.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Make email the primary login field
    email = models.EmailField(unique=True, max_length=255, blank=False)
    # Override username to be optional / non-unique (OAuth providers may not supply)
    username = models.CharField(max_length=150, blank=True, null=True, unique=False)
    date_joined = models.DateTimeField(default=timezone.now)
    dummy_user = models.BooleanField(default=False) #type: ignore
    phone_number = models.CharField(max_length=255, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=255, blank=True, null=True)
    state = models.CharField(max_length=255, blank=True, null=True)
    zip_code = models.CharField(max_length=255, blank=True, null=True)
    country = models.CharField(max_length=255, blank=True, null=True)
    profile_picture = models.ImageField(upload_to="profile_pictures/", blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    preferred_language = models.CharField(max_length=255, blank=True, null=True, default='en')


    # Use email for authentication; keep username for display / legacy purposes
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    def __str__(self):
        return self.email 

class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=255)
    created_at = models.DateTimeField(default=timezone.now)
    used = models.BooleanField(default=False)#type: ignore

# ---------------------------------------------------------------------------
# Custom manager (declared at bottom to avoid circular names during class body)
# ---------------------------------------------------------------------------

class UserManager(BaseUserManager):
    """Manager where email is the unique identifiers for auth instead of usernames."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, password, **extra_fields)

User.add_to_class("objects", UserManager()) 