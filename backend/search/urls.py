from django.urls import path
from .views import SearchAPIView,SuggestionAPIView

urlpatterns = [
    path("", SearchAPIView.as_view()),
    
    path("suggestions/", SuggestionAPIView.as_view()),
]