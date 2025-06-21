from rest_framework import serializers
from core.models import User
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=False)

    def validate(self, attrs):
        """If confirm_password is supplied validate that it matches password.
        The field is optional so that clients that do not send it (e.g. our
        current React RegisterForm) still register successfully."""
        password = attrs.get('password')
        confirm = attrs.get('confirm_password')

        # Only enforce the match check if the confirm field was provided
        if confirm is not None and password != confirm:
            raise serializers.ValidationError("Passwords do not match")
        return attrs
   
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
            "preferred_language",
            "date_joined",
            "password",
            "confirm_password",
        )
        extra_kwargs = {
            'password': {'write_only': True},
            'confirm_password': {'write_only': True},
            'username': {'required': True},
        }

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def create(self, validated_data):
        if not validated_data.get('username'):
            raise serializers.ValidationError("Username is required")
        if not validated_data.get('email'):
            raise serializers.ValidationError("Email is required")
        if not validated_data.get('password'):
            raise serializers.ValidationError("Password is required")
        password = validated_data.pop("password")
        validated_data.pop("confirm_password", None)

        user = User.objects.create_user(password=password, **validated_data)
        return user
    
    def update(self, instance, validated_data):
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super().update(instance, validated_data)