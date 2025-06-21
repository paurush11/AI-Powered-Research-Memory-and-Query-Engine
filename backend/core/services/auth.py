from rest_framework_simplejwt.tokens import RefreshToken
from django.middleware.csrf import get_token
from django.conf import settings
from django.http import HttpResponse
from django.core.exceptions import ValidationError
from django.utils.http import urlencode
from urllib.parse import quote
import requests
from core.models import User
from rest_framework import status
from rest_framework.response import Response
from core.models import PasswordResetToken
from django.utils import timezone
import secrets


class AuthService:
    @staticmethod
    def get_tokens_for_user(user):
        """
        Generate JWT tokens for a user
        """
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token), #type: ignore
        }

    @staticmethod
    def set_cookie(response, key, value, secure=False, samesite='Lax', max_age=None, httponly=False):
        """
        Set a cookie in the response
        """
        response.set_cookie(key, value, secure=secure, samesite=samesite, max_age=max_age, httponly=httponly)

    
    @staticmethod
    def set_jwt_cookies(response, tokens, request=None):
        """
        Set JWT cookies in the response
        """
     
        AuthService.set_cookie(
            response,
            'refresh_token',
            tokens['refresh'],
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax',
            max_age=int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()),
        )
        AuthService.set_cookie(
            response,
            'access_token',
            tokens['access'],
            secure=not settings.DEBUG,
            httponly=True,
            samesite='Lax',
            max_age=int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
        )

        if request:
            csrf_token = get_token(request)
            AuthService.set_cookie(
                response,
                'csrftoken',
                csrf_token,
                secure=not settings.DEBUG,
                httponly=False,
                samesite='Lax',
                max_age=int(settings.SIMPLE_JWT['CSRF_COOKIE_AGE']),
            )

            response['X-CSRFToken'] = csrf_token

        return response

    @staticmethod
    def clear_jwt_cookies(response):
        """
        Clear JWT cookies from the response
        """
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        response.delete_cookie('csrftoken')
        response.delete_cookie('X-CSRFToken')

    @staticmethod
    def google_auth_initiate(request):
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
            return {'auth_url': auth_url}

        except Exception as e:
            raise ValidationError(str(e))

    @staticmethod
    def google_auth_callback(request):
        """
        Handle Google OAuth callback
        """
        try:
            code = request.GET.get('code')
            state = request.GET.get('state')
            frontend_redirect_uri = str(settings.FRONTEND_REDIRECT_URI)
            requests_frontend_redirect_uri = request.session.get('frontend_redirect_uri')
            if requests_frontend_redirect_uri != frontend_redirect_uri:
                raise ValidationError('Invalid redirect URI')
            if request.session.get('google_auth_state') != state:
                raise ValidationError('Invalid state')
            if not code:
                raise ValidationError('Authorization code not provided')
            # Exchange code for tokens
            token_response = requests.post(
                'https://oauth2.googleapis.com/token',
                data={
                    'code': code,
                    'client_id': str(settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY),
                    'client_secret': str(settings.SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET),
                    'redirect_uri': str(settings.BACKEND_REDIRECT_URI),
                    'grant_type': 'authorization_code'
                }
            )
            if token_response.status_code != 200:
                return Response(
                    {'error': 'Failed to exchange code for tokens'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            tokens = token_response.json()
            access_token = tokens['access_token']
            # Get basic user info from Google
            user_info = requests.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                params={'access_token': access_token}
            ).json()
            # Create or update user with all available information
            user_data = AuthService.construct_user_data(user_info)
            try:
                # First try to get existing user by email
                user = User.objects.filter(email=user_info['email']).first()
                if user:
                    # Update existing user with latest info from Google
                    for key, value in user_data.items():
                        if key != 'email':  # Don't update email as it's the unique identifier
                            setattr(user, key, value)
                    user.save()
                    created = False
                else:
                    # Create new user
                    user, created = User.objects.get_or_create(
                        username=user_info['email'],
                        email=user_info['email'],
                        defaults=user_data
                    )
            except Exception as e:
                return Response(
                    {'error': 'Failed to create or update user'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Generate JWT tokens
            jwt_tokens = AuthService.get_tokens_for_user(user)
            # Create response with cookies
            response = HttpResponse(status=302)
            response = AuthService.set_jwt_cookies(response, jwt_tokens, request)
            response['Location'] = frontend_redirect_uri
            
            return response

        except Exception as e:
            error_message = quote(str(e))
            redirect_url = f"{frontend_redirect_uri}?error={error_message}"
            return HttpResponse(status=302, headers={'Location': redirect_url})

    @staticmethod
    def construct_user_data(user_info):
        """
        Construct user data from Google user info
        """
        first_name = user_info.get('given_name', '')
        last_name = user_info.get('family_name', '')
        email = user_info.get('email', '')
        username = first_name + last_name + email + "google"
        profile_picture = user_info.get('picture', None)
        if not profile_picture:
            profile_picture = "some_default_url"
        
        return {
            'first_name': first_name,
            'last_name': last_name,
            'is_active': True,
            'profile_picture': profile_picture,
            'email': email,
            'username': username,
            'preferred_language': 'en',
            'dummy_user': False
        }

    @staticmethod
    def generate_password_reset_token(user):
        """
        Generate a password reset token for the user
        """
        token = secrets.token_urlsafe(32)
        PasswordResetToken.objects.create(user=user, token=token, used=False) #type: ignore
        return token

    @staticmethod
    def verify_password_reset_token(token):
        """
        Verify a password reset token and return the user if valid
        """
        try:
            user = PasswordResetToken.objects.filter( #type: ignore
                token=token,
                created_at__gte=timezone.now() - timezone.timedelta(hours=24),
                used=False
            ).first()
            
            if user:
                PasswordResetToken.objects.filter(token=token).update(used=True) #type: ignore
                return user
            return None
        except Exception as e:
            return None 
    
    