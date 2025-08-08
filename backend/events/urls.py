from django.urls import path
from .views import GetActivity_fromView
from .views import GetAllActivityView
urlpatterns = [
    path('GetActivity_from/<int:id>/', GetActivity_fromView.as_view(), name='GetActivity_from'),
    path('GetAllActivityView/',GetAllActivityView.as_view(),name='GetAllActivityView')
]