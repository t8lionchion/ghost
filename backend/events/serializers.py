from events.models import Activity_Form,Active_questions,Active_question_options
from rest_framework import serializers

class GetAllActivitySerializers(serializers.Serializer):
    id=serializers.IntegerField(read_only=True)
    Activity_name=serializers.CharField(read_only=True)
    descripe=serializers.CharField(read_only=True)
    address=serializers.CharField(read_only=True)
    get_activity_form=serializers.SerializerMethodField()
    def get_activity_form(self,obj):
        return obj.id ,obj.Activity_name,obj.descripe,obj.address


class GetActivity_fromSerializers(serializers.ModelSerializer):
    class Meta:
        model=Activity_Form
        fields = "__all__"


class QuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Active_question_options
        fields = ("id", "option_label", "option_value", "sort_order")

class QuestionSerializer(serializers.ModelSerializer):
    options = QuestionOptionSerializer(
        source="options_by_options_id", many=True, read_only=True
    )

    class Meta:
        model = Active_questions
        fields = ("id", "question_text", "sort_order", "options")

class ActivityWithQuestionsSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Activity_Form
        fields = ("id", "Activity_name", "Activity_start_date", "Activity_end_date", "descripe", "questions")


