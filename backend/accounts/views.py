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
