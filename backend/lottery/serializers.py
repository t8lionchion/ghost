# events/serializers.py
from rest_framework import serializers

class SubmitAnswersSerializer(serializers.Serializer):
    answers = serializers.ListField(
        child=serializers.DictField(child=serializers.CharField()),
        allow_empty=False
    )

    def validate(self, attrs):
        # 轉成 {question_id: value}
        pairs = {}
        for item in attrs['answers']:
            try:
                qid = int(item['question_id'])
                val = str(item['value']).strip()
            except (KeyError, ValueError, TypeError):
                raise serializers.ValidationError("answers 格式錯誤")
            pairs[qid] = val
        attrs['pairs'] = pairs
        return attrs
