from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import User
from core.serializers import UserSerializer
from rest_framework.decorators import action
from django.contrib.auth import authenticate
from django.conf import settings
from django.middleware.csrf import get_token
from django.utils.http import urlencode
import secrets
from django.core.exceptions import ValidationError
from core.services.auth import AuthService


class AuthViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'google_auth_initiate', 'google_auth_callback', 'login', 'logout', 'forgot_password', 'reset_password']:
            return [AllowAny()]
        return super().get_permissions()

    def list(self, request, *args, **kwargs):
        """
        List all users (admin only)
        """
        if not request.user.is_staff:
            return Response(
                {'error': 'You do not have permission to perform this action'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().list(request, *args, **kwargs)


    @action(detail=False, methods=['post'])
    def login(self, request):
        """
        Login with email and password
        """
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {'error': 'Email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Check if user exists and is active
            user = User.objects.filter(email=email).first()
            if not user:
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            if not user.is_active:
                return Response(
                    {'error': 'Account is inactive'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Check password directly first
            if not user.check_password(password):
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # If password is correct, authenticate the user
            user = authenticate(request, email=user.email, username=user.username, password=password)
            if not user:
                return Response(
                    {'error': 'Authentication failed'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Generate JWT tokens using UserService
            jwt_tokens = AuthService.get_tokens_for_user(user)
            
            # Create response with cookies using UserService
            response = Response(UserSerializer(user).data)
            response = AuthService.set_jwt_cookies(response, jwt_tokens, request)
            
            return response

        except Exception as e:
            return Response(
                {'error': 'An error occurred during login'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def logout(self, request):
        """
        Logout user by clearing JWT cookies and CSRF token
        """
        try:
            response = Response({'message': 'Successfully logged out'})
            
            # Clear all authentication cookies
            response.delete_cookie('access_token', domain=None, path='/')
            response.delete_cookie('refresh_token', domain=None, path='/')
            response.delete_cookie(settings.CSRF_COOKIE_NAME, domain=None, path='/')
            
            # Set new CSRF token
            csrf_token = get_token(request)
            response.set_cookie(
                settings.CSRF_COOKIE_NAME,
                csrf_token,
                secure=not settings.DEBUG,
                samesite=settings.CSRF_COOKIE_SAMESITE,
                max_age=24 * 60 * 60  # 1 day
            )
            response['X-CSRFToken'] = csrf_token
            
            return response
            
        except Exception as e:
            return Response(
                {'error': 'An error occurred during logout'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='google-auth-initiate')
    def google_auth_initiate(self, request):
        """
        Initiate Google OAuth flow
        """
        try:
            
            frontend_redirect_uri = request.GET.get('frontend_redirect_uri', f"{settings.FRONTEND_REDIRECT_URI}")
            state = secrets.token_hex(16)
            request.session['google_auth_state'] = state
            request.session['frontend_redirect_uri'] = frontend_redirect_uri
           
            # Google OAuth parameters
            params = {
                'client_id': settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY,
                'redirect_uri': f"{settings.BACKEND_REDIRECT_URI}",
                'response_type': 'code',
                'scope': 'email profile',
                'access_type': 'offline',
                'prompt': 'consent',
                'state': state
            }
            auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
            return Response({'auth_url': auth_url})

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'], url_path='google-auth-callback')
    def google_auth_callback(self, request, *args, **kwargs):
        """
        Handle Google OAuth callback
        """
        try:
            state = request.GET.get('state')
            if not state:
                raise ValidationError('State parameter is missing') #type: ignore
            return AuthService.google_auth_callback(request)

        except ValidationError as e:
            return AuthService.google_auth_callback(request)

    def create(self, request, *args, **kwargs):
        """
        Create a new user account
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            # Create the user
            user = serializer.save()
            
            # Generate JWT tokens and attach them as cookies
            jwt_tokens = AuthService.get_tokens_for_user(user)

            response = Response(serializer.data, status=status.HTTP_201_CREATED)
            response = AuthService.set_jwt_cookies(response, jwt_tokens, request)
            
            return response
            
        except Exception as e:
            return Response(
                {'error': 'An error occurred while creating the account'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'], url_path='change-password')
    def change_password(self, request):
        """
        Change user password
        """
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response(
                {'error': 'Both old and new passwords are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not request.user.check_password(old_password):
            return Response(
                {'error': 'Old password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )

        request.user.set_password(new_password)
        request.user.save()
        return Response({'message': 'Password updated successfully'})

    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Get current user info
        """
        if request.user.is_authenticated:
            return Response(UserSerializer(request.user).data)
        return Response(
            {'error': 'Not authenticated'},
            status=status.HTTP_401_UNAUTHORIZED
        )

