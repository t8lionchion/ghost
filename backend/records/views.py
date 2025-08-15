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
from records.permissions import IsVipOrOwner,IsAdminOrOwner
from django.shortcuts import get_object_or_404


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import transaction
from .pagination import StandardResultsSetPagination
class ChangeEventRecordView(APIView):
    authentication_classes = [MyJWTAuthentication]
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(self, request, id):
        # 僅限 Admin 軟刪除
        if getattr(request.user, "role", 0) != 3:
            return Response({"detail": "權限不足"}, status=status.HTTP_403_FORBIDDEN)

        rec = get_object_or_404(Event_Record.objects.select_for_update(), pk=id)

        # 已經是軟刪除狀態就直接回覆
        if not rec.is_active:
            return Response({"ok": True, "already": True, "message": "該筆已是軟刪除狀態"}, status=status.HTTP_200_OK)

        # 執行軟刪除
        rec.is_active = False
        # 若有 updated_at / deleted_at / deleted_by 欄位可一起更新
        # rec.deleted_at = timezone.now()
        # rec.deleted_by = request.user
        rec.save(update_fields=["is_active"])  # 視欄位增加項目
        return Response({"ok": True, "soft_deleted": True, "message": "已軟刪除"}, status=status.HTTP_200_OK)

class ApproveEventRecordView(APIView):
    authentication_classes = [MyJWTAuthentication]
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(self, request, id):
        if getattr(request.user, "role", 0) != 3:
            return Response({"detail": "權限不足"}, status=status.HTTP_403_FORBIDDEN)

        rec = get_object_or_404(Event_Record.objects.select_for_update(), pk=id)

        if rec.lat is None or rec.lng is None:
            return Response({"ok": False, "message": "缺少經緯度，無法審核通過"}, status=400)

        if rec.is_active:
            return Response({"ok": True, "already": True}, status=200)

        rec.is_active = True
        rec.save(update_fields=["is_active"])
        return Response({"ok": True, "already": False}, status=200)


class NotReviewedEventLocationsView(APIView):
    authentication_classes = [MyJWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        role = getattr(request.user, "role", 0)

        base = Event_Record.objects.filter(
            is_active=False
        ).exclude(lat__isnull=True).exclude(lng__isnull=True)

        # Admin(3) 看全部；其他人只能看自己的
        if role != 3:
            return Response({'message':'權限不足'},status=status.HTTP_403_FORBIDDEN)
        
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(base, request, view=self)
        serializer = EventRecordLocationSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
class ReviewedEventLocationsView(APIView):
    authentication_classes = [MyJWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        role = getattr(request.user, "role", 0)

        base = Event_Record.objects.filter(
            is_active=True
        ).exclude(lat__isnull=True).exclude(lng__isnull=True)

        # Admin(3) 看全部；其他人只能看自己的
        if role !=3:
            return Response({'message':'權限不足'},status.HTTP_403_FORBIDDEN)
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(base, request, view=self)
        serializer = EventRecordLocationSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)



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


class EventDetailView(APIView):
    authentication_classes = [MyJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        obj = get_object_or_404(Event_Record, pk=pk)
        # 物件層級權限
        """ checker = IsVipOrOwner()
        if not checker.has_object_permission(request, self, obj):
            return Response({"detail": "無權限查看此事件"}, status=403) """
        data = EventRecordLocationDetailSerializer(obj, context={'request': request}).data
        return Response(data, status=200)