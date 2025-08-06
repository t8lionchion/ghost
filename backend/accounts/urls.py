# accounts/urls.py
from django.urls import path
from .views import UsersRegisterView
from .views import MyTokenObtainPairView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('register/', UsersRegisterView.as_view(), name='user-register'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # 更新 token
    path('login/', MyTokenObtainPairView.as_view(), name='my_token_obtain_pair'),
]
