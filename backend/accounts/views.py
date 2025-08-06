from django.shortcuts import render
from django.http import JsonResponse
from django.db import transaction
from rest_framework.generics import GenericAPIView
from rest_framework import generics
from accounts.serializers import UsersSerializers 
from accounts.models import Users
# Create your views here.

class UsersRegisterView(generics.CreateAPIView):
    queryset = Users.objects.all()
    serializer_class = UsersSerializers
# views.py
from rest_framework_simplejwt.views import TokenObtainPairView
from accounts.serializers import MyTokenObtainPairSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from accounts.serializers import MyTokenRefreshSerializer

class MyTokenRefreshView(APIView):
    def post(self, request):
        serializer = MyTokenRefreshSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)