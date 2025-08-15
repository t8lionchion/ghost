from django.shortcuts import render
from django.http import JsonResponse
from django.db import transaction
from rest_framework.generics import GenericAPIView
from rest_framework import generics
from accounts.serializers import UsersSerializers 
from accounts.models import Users
from rest_framework_simplejwt.views import TokenObtainPairView
from accounts.serializers import MyTokenObtainPairSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from accounts.serializers import MyTokenRefreshSerializer
from accounts.serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated
from accounts.auth import MyJWTAuthentication
from .pagination import StandardResultsSetPagination
# Create your views here.

class ListAllUserView(APIView):
    authentication_classes = [MyJWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # 只允許 Admin
        role = int(getattr(request.user, "role", 0) or 0)
        if role != 3:
            return Response({"detail": "權限不足"}, status=status.HTTP_403_FORBIDDEN)

        # 取資料 + 決定性排序（避免分頁跨頁重覆/遺漏）
        qs = Users.objects.all().order_by("id")

        # 套用分頁（APIViews 需手動）
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        serializer = UserSerializer(page, many=True)

        # 回傳 DRF 標準分頁格式：{count,next,previous,results}
        return paginator.get_paginated_response(serializer.data)

class UsersRegisterView(generics.CreateAPIView):
    queryset = Users.objects.all()
    serializer_class = UsersSerializers
# views.py

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer



class MyTokenRefreshView(APIView):
    def post(self, request):
        serializer = MyTokenRefreshSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)