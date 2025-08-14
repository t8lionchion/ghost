from django.shortcuts import render
from events.serializers import GetActivity_fromSerializers
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from events.models import Activity_Form,Active_questions,Active_question_options,GeoCheckpoint, UserProgress
from django.http import Http404
from events.serializers import GetAllActivitySerializers
from rest_framework.decorators import permission_classes,authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from accounts.auth import MyJWTAuthentication
from django.db.models import Prefetch
from events.serializers import ActivityWithQuestionsSerializer
from events.utils import haversine_m
from django.shortcuts import get_object_or_404 
# Create your views here.

class GetActivity_fromView(APIView):
    authentication_classes = [MyJWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self,request,id,format=None):
        #print("Activity_Form",Activity_Form.objects.filter(pk=id).values("id"))
        try:
            obj=Activity_Form.objects.get(pk=id)
        except Activity_Form.DoesNotExist :
            raise Http404("找不到指定活動")
        serializer=GetActivity_fromSerializers(obj)
        return Response(serializer.data,status=status.HTTP_200_OK)

class GetAllActivityView(generics.ListAPIView):
    queryset=Activity_Form.objects.all()
    serializer_class=GetAllActivitySerializers


class GetActivityWithQuestionsView(APIView):
    authentication_classes = [MyJWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request, id, format=None):
        try:
            activity = (
                Activity_Form.objects
                .filter(pk=id)
                .prefetch_related(
                    Prefetch(
                        "questions",
                        queryset=Active_questions.objects.order_by("sort_order", "id").prefetch_related(
                            Prefetch(
                                "options_by_options_id",
                                queryset=Active_question_options.objects.order_by("sort_order", "id")
                            )
                        )
                    )
                )
                .get()
            )
        except Activity_Form.DoesNotExist:
            raise Http404("找不到指定活動")

        data = ActivityWithQuestionsSerializer(activity).data
        return Response(data, status=status.HTTP_200_OK)

class GateInfoView(APIView):
    """
    GET /api/activities/<id>/gate/
    回傳此活動的 經緯度 設定與目前使用者是否已通過 經緯度。
    """
    authentication_classes = [MyJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, id, format=None):
        act = get_object_or_404(Activity_Form, pk=id)
        gate = GeoCheckpoint.objects.filter(activity=act, order=1).first()

        if not gate:
            return Response({
                "geo_enabled": False,
                "verified": True,   # 沒有 Gate 視為不限制
                "gate": None
            }, status=status.HTTP_200_OK)

        prog = UserProgress.objects.filter(user=request.user, activity=act).first()
        verified = bool(prog and prog.unlocked_stage >= 1)

        return Response({
            "geo_enabled": True,
            "verified": verified,
            "gate": {
                "order": 1,
                "title": gate.title,
                "lat": gate.lat,
                "lng": gate.lng,
                "radius_m": gate.radius_m,
            }
        }, status=status.HTTP_200_OK)


class CheckinView(APIView):
    """
    POST /api/activities/id/checkin/
    將使用者的經緯度傳給後端
    request格式{ "lat": <float>, "lng": <float> }
    伺服器驗證是否在 Gate 半徑內，通過則標記 UserProgress。
    """
    authentication_classes = [MyJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, id, format=None):
        act = get_object_or_404(Activity_Form, pk=id)
        gate = GeoCheckpoint.objects.filter(activity=act, order=1).first()
        if not gate:
            return Response({"ok": False, "reason": "geo_not_enabled"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            lat = float(request.data.get("lat"))
            lng = float(request.data.get("lng"))
        except (TypeError, ValueError):
            return Response({"ok": False, "reason": "invalid_lat_lng"}, status=status.HTTP_400_BAD_REQUEST)

        dist = haversine_m(lat, lng, gate.lat, gate.lng)
        if dist <= gate.radius_m:
            prog, _ = UserProgress.objects.get_or_create(user=request.user, activity=act)
            if prog.unlocked_stage < 1:
                prog.unlocked_stage = 1
            prog.last_lat = lat
            prog.last_lng = lng
            prog.save(update_fields=["unlocked_stage", "last_lat", "last_lng", "last_checkin_at"])
            return Response({"ok": True, "verified": True, "distance_m": round(dist, 2)}, status=status.HTTP_200_OK)

        return Response({
            "ok": False,
            "reason": "not_in_radius",
            "distance_m": round(dist, 2),
            "radius_m": gate.radius_m
        }, status=status.HTTP_400_BAD_REQUEST)