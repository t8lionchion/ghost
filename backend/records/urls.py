# records/urls.py
from django.urls import path
from .views import PublicEventLocationsView, MyEventLocationsView
from .views import EventReportCreateView
from .views import EventDetailView
urlpatterns = [
    path('records/locations/public/', PublicEventLocationsView.as_view()),
    path('records/locations/me/', MyEventLocationsView.as_view()),
    path('records/reports/',EventReportCreateView.as_view()),
    path('records/<int:pk>/', EventDetailView.as_view(), name='records-detail'),
]
