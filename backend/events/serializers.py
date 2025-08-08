from events.models import Activity_Form,Active_questions,Active_question_options
from rest_framework import serializers

class GetActivity_fromSerializers(serializers.ModelSerializer):
    class Meta:
        model=Activity_Form
        fields = "__all__"
        