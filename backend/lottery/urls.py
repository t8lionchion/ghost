from django.urls import path

from .views import SubmitActivityAnswersView
from .views import GetNumberOfDrawsView,ActivityCheckedIsjoined
urlpatterns = [
    path('activities/<int:active_id>/submit/',SubmitActivityAnswersView.as_view()),
    path('<int:activity_id>/lottery/count/', GetNumberOfDrawsView.as_view(), name='lottery-count'),
    path('activities/<int:id>/checkjoined/',ActivityCheckedIsjoined.as_view())
]