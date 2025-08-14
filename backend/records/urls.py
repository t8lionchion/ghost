# records/urls.py
from django.urls import path
from .views import PublicEventLocationsView, MyEventLocationsView
from .views import EventReportCreateView
from .views import EventDetailView,NotReviewedEventLocationsView,ReviewedEventLocationsView,ApproveEventRecordView,ChangeEventRecordView
urlpatterns = [
    path('records/locations/public/', PublicEventLocationsView.as_view()),
    path('records/locations/me/', MyEventLocationsView.as_view()),
    path('records/reports/',EventReportCreateView.as_view()),
    path('records/<int:pk>/', EventDetailView.as_view(), name='records-detail'),
    path('records/Noreview/',NotReviewedEventLocationsView.as_view()),
    path('records/reviewed/',ReviewedEventLocationsView.as_view()),
    path("records/<int:id>/approve/", ApproveEventRecordView.as_view()),
    path("records/<int:id>/delete/", ChangeEventRecordView.as_view()),
]
