from django.urls import path
from rest_framework.response import Response
from rest_framework.decorators import api_view

@api_view(["POST"])
def chat_endpoint(request):
    """Stub chat endpoint to be implemented with LangGraph."""
    return Response({"message": "Chat endpoint not implemented yet"})

urlpatterns = [
    path("chat/", chat_endpoint),
] 