from django.utils import timezone
from rest_framework import serializers
from records.models import Event_Record

# 地圖清單用：輕量欄位
class EventRecordLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event_Record
        fields = ['id', 'event_name', 'lat', 'lng', 'level', 'is_active', 'event_occurs_time']


# 詳細頁用：包含完整圖片 URL
class EventRecordLocationDetailSerializer(serializers.ModelSerializer):
    event_image_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Event_Record
        fields = ['id', 'event_name', 'event_image', 'event_image_url',
                  'address', 'event_occurs_time', 'created_at', 'level', 'descriptions']

    def get_event_image_url(self, obj):
        req = self.context.get('request')
        f = getattr(obj, 'event_image', None)
        if not f:
            return None
        try:
            url = f.url   # /media/...
        except Exception:
            return None
        return req.build_absolute_uri(url) if req else url


class EventReportCreateSerializer(serializers.ModelSerializer):
    event_image_url = serializers.SerializerMethodField(read_only=True)
    # 圖片設為選填，避免沒附檔就 400/500
    event_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Event_Record
        fields = [
            'id',
            'event_name',
            'event_image',
            'event_image_url',
            'address',
            'event_occurs_time',
            'level',
            'descriptions',
            'is_active',
            # 若你的 Model 確實有下列欄位，建議也加進來（否則不要動它們）
            # 'lat', 'lng', 'formatted_address', 'place_id', 'geocoded_at',
        ]
        read_only_fields = ['is_active']  # 前台不可指定

    def get_event_image_url(self, obj):
        req = self.context.get('request')
        f = getattr(obj, 'event_image', None)
        if not f:
            return None
        try:
            url = f.url
        except Exception:
            return None
        return req.build_absolute_uri(url) if req else url

    def validate_event_occurs_time(self, v):
        # 可依需求移除；此為避免未來過遠的時間
        if v > timezone.now() + timezone.timedelta(days=365*3):
            raise serializers.ValidationError("事件時間過於遙遠，請確認。")
        return v

    def validate_level(self, v):
        if v not in (1, 2, 3):
            raise serializers.ValidationError("level 只能是 1/2/3。")
        return v

    def create(self, validated_data):
        # 綁上報者、強制審核狀態
        validated_data['user'] = self.context['request'].user
        validated_data['is_active'] = False

        # （可選）嘗試地理編碼——失敗不致命
        addr = validated_data.get('address')
        if addr:
            try:
                from common.services.geocode import geocode_address
                data = geocode_address(addr) or {}
            except Exception:
                data = {}

            # 只寫入「模型真的有的欄位」，避免 unexpected keyword argument
            model_fields = {f.name for f in Event_Record._meta.get_fields()}
            for k in ('formatted_address', 'place_id', 'lat', 'lng'):
                if k in model_fields and (val := data.get(k)) is not None:
                    validated_data[k] = val
            if 'geocoded_at' in model_fields:
                validated_data['geocoded_at'] = timezone.now()

        return super().create(validated_data)
