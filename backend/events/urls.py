from django.urls import path
from .views import GetActivity_fromView

urlpatterns = [
    path('GetActivity_from/<int:id>/', GetActivity_fromView.as_view(), name='GetActivity_from'),
]