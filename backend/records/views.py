from django.shortcuts import render

# Create your views here.
# events/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.auth import MyJWTAuthentication
from records.models import Event_Record
from records.serializers import EventRecordLocationSerializer,EventRecordLocationDetailSerializer
from records.serializers import EventReportCreateSerializer
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import status

class PublicEventLocationsView(APIView):

    def get(self, request):
        qs = Event_Record.objects.filter(is_active=True).exclude(lat__isnull=True).exclude(lng__isnull=True)
        data = EventRecordLocationSerializer(qs, many=True).data
        return Response(data, status=200)

class MyEventLocationsView(APIView):
    authentication_classes = [MyJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Event_Record.objects.filter(user_id=request.user.id).exclude(lat__isnull=True).exclude(lng__isnull=True)
        data = EventRecordLocationDetailSerializer(qs, many=True).data
        return Response(data, status=200)

class EventReportCreateView(APIView):
    authentication_classes = [MyJWTAuthentication]
    permission_classes = [IsAuthenticated] 
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        ser = EventReportCreateSerializer(data=request.data, context={'request': request})
        ser.is_valid(raise_exception=True)
        obj = ser.save()  # user 會在 serializer.create 綁定
        return Response(EventReportCreateSerializer(obj, context={'request': request}).data,
                        status=status.HTTP_201_CREATED)

class MyLocationsView(APIView):
    authentication_classes = [MyJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Event_Record.objects.filter(user_id=request.user.id).exclude(lat__isnull=True).exclude(lng__isnull=True)
        data = EventRecordLocationSerializer(qs, many=True, context={'request': request}).data
        return Response(data, status=200)

from records.permissions import IsVipOrOwner
from django.shortcuts import get_object_or_404

class EventDetailView(APIView):
    authentication_classes = [MyJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        obj = get_object_or_404(Event_Record, pk=pk)
        # 物件層級權限
        checker = IsVipOrOwner()
        if not checker.has_object_permission(request, self, obj):
            return Response({"detail": "無權限查看此事件"}, status=403)
        data = EventRecordLocationDetailSerializer(obj, context={'request': request}).data
        return Response(data, status=200)