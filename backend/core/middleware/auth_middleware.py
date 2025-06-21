from django.contrib.auth import get_user_model
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.http import HttpResponseForbidden
from rest_framework.response import Response
from rest_framework import status
from rest_framework.renderers import JSONRenderer
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

User = get_user_model()

class TokenAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.jwt_authentication = JWTAuthentication()

    def __call__(self, request):
        # Exempt CSRF for API endpoints
        
        if request.path.startswith('/api/'):
            setattr(request, '_dont_enforce_csrf_checks', True)

        # Skip authentication for static files, media files, and admin
        if (request.path.startswith('/static/') or 
            request.path.startswith('/media/') or 
            request.path.startswith('/admin/') or
            request.path.startswith('/__debug__/')):
            return self.get_response(request)

        public_paths = [
            '/api/auth/login/',
            '/api/auth/forgot-password/',
            '/api/auth/reset-password/',
            '/api/auth/google-auth-initiate/',
            '/api/auth/google-auth-callback/',
            '/api/auth/register/',
        ]
        
        # Allow POST to create user - handle both with and without trailing slash
        if (request.path == '/api/auth/' or request.path == '/api/auth') and request.method == 'POST':
            return self.get_response(request)
        
        # Normalize path to ensure trailing slash doesn't matter
        normalized_path = request.path if request.path.endswith('/') else request.path + '/'
        if normalized_path in public_paths:
            return self.get_response(request)

        # For all other paths, use token authentication.
        access_token = request.COOKIES.get('access_token')
        
        if not access_token:
            response = Response(
                {'detail': 'Authentication credentials were not provided or expired.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
            response.accepted_renderer = JSONRenderer() #type: ignore
            response.accepted_media_type = 'application/json' #type: ignore
            response.renderer_context = {} #type: ignore
            return response.render()

        try:
            validated_token = self.jwt_authentication.get_validated_token(access_token)
            user = self.jwt_authentication.get_user(validated_token)
            
            if not user.is_active:
                response = Response(
                    {'detail': 'User account is disabled.'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
                response.accepted_renderer = JSONRenderer() #type: ignore
                response.accepted_media_type = 'application/json' #type: ignore
                response.renderer_context = {} #type: ignore
                return response.render()
                
            request.user = user
            request.auth = validated_token
        except (InvalidToken, TokenError) as e:
            response = Response(
                {'detail': 'Invalid token.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
            response.accepted_renderer = JSONRenderer() #type: ignore
            response.accepted_media_type = 'application/json' #type: ignore
            response.renderer_context = {} #type: ignore
            return response.render()

        return self.get_response(request)