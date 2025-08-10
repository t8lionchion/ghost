from events.models import Activity_Form,Active_questions,Active_question_options
from rest_framework import serializers

class GetAllActivitySerializers(serializers.Serializer):
    id=serializers.IntegerField(read_only=True)
    Activity_name=serializers.CharField(read_only=True)
    descripe=serializers.CharField(read_only=True)
    get_activity_form=serializers.SerializerMethodField()
    def get_activity_form(self,obj):
        return obj.id ,obj.Activity_name,obj.descripe


class GetActivity_fromSerializers(serializers.ModelSerializer):
    class Meta:
        model=Activity_Form
        fields = "__all__"
        