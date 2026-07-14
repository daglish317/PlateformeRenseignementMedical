from django.urls import path
from .views import SearchAPIView,SuggestionAPIView

urlpatterns = [
    path("", SearchAPIView.as_view(), name="search"),
    
    path("suggestions/", SuggestionAPIView.as_view(),name="search-suggestions"),
]