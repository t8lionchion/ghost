# accounts/urls.py
from django.urls import path
from .views import UsersRegisterView

urlpatterns = [
    path('register/', UsersRegisterView.as_view(), name='user-register'),
]
