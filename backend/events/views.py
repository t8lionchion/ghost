from django.shortcuts import render
from events.serializers import GetActivity_fromSerializers
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from events.models import Activity_Form
from django.http import Http404
# Create your views here.

class GetActivity_fromView(APIView):
    def get(self,request,id,format=None):
        #print("Activity_Form",Activity_Form.objects.filter(pk=id).values("id"))
        try:
            obj=Activity_Form.objects.get(pk=id)
        except Activity_Form.DoesNotExist :
            raise Http404("找不到指定活動")
        serializer=GetActivity_fromSerializers(obj)
        return Response(serializer.data,status=status.HTTP_200_OK)
        