from rest_framework import serializers
from core.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        read_only_fields = ("id", "date_joined")
        fields = (
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "phone_number",
            "address",
            "city",
            "state",
            "zip_code",
            "country",
            "profile_picture",
            "bio",
            "dummy_user",
            "date_joined",
        )