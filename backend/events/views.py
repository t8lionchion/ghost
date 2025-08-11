from django.shortcuts import render
from events.serializers import GetActivity_fromSerializers
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from events.models import Activity_Form,Active_questions,Active_question_options
from django.http import Http404
from events.serializers import GetAllActivitySerializers
from rest_framework.decorators import permission_classes,authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from accounts.auth import MyJWTAuthentication
from django.db.models import Prefetch
from events.serializers import ActivityWithQuestionsSerializer

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
