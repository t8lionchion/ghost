from django.urls import path

from .views import SubmitActivityAnswersView

urlpatterns = [
    path('activities/<int:active_id>/submit/',SubmitActivityAnswersView.as_view())
]