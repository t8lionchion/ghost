# accounts/urls.py
from django.urls import path
from .views import UsersRegisterView
from .views import MyTokenObtainPairView
from .views import MyTokenRefreshView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('register/', UsersRegisterView.as_view(), name='user-register'),
    path('login/', MyTokenObtainPairView.as_view(), name='my_token_obtain_pair'),
    path('token/refresh',MyTokenRefreshView.as_view(),name='my_token_refresh')
]
