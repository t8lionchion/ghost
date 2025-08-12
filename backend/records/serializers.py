
from rest_framework import serializers
from records.models import Event_Record
from django.utils import timezone

class EventRecordLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event_Record
        fields = ['id', 'event_name', 'lat', 'lng','level', 'is_active', 'event_occurs_time']

class EventRecordLocationDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event_Record
        fields =  ['id','event_name','event_image','address','event_occurs_time','created_at','level','descriptions']
        def get_event_image_url(self, obj):
            request = self.context.get('request')
            if obj.event_image:
                url = obj.event_image.url      # 自帶 /media/ 前綴
                return request.build_absolute_uri(url) if request else url
            return None



class EventReportCreateSerializer(serializers.ModelSerializer):
    event_image_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Event_Record
        fields = [
            'id',
            'event_name',
            'event_image',        # ImageField，multipart 上傳
            'event_image_url',    # 只讀，回傳完整 URL
            'address',
            'event_occurs_time',
            'level',
            'descriptions',
            'is_active',          # 可選，若需要審核流程就改成只讀
        ]
        read_only_fields = ['is_active']  # 一般用戶上報預設不公開，等後台審核

    # 圖片完整 URL
    def get_event_image_url(self, obj):
        req = self.context.get('request')
        if obj.event_image:
            url = obj.event_image.url  # 會自帶 /media/
            return req.build_absolute_uri(url) if req else url
        return None

    # 基本驗證（你可再加嚴格）
    def validate_event_occurs_time(self, v):
        # 允許過去發生的事件就拿掉這段
        if v > timezone.now() + timezone.timedelta(days=365*3):
            raise serializers.ValidationError("事件時間過於遙遠，請確認。")
        return v

    def validate_level(self, v):
        if v not in (1, 2, 3):
            raise serializers.ValidationError("level 只能是 1/2/3。")
        return v

    def create(self, validated):
        # 綁定上報者
        validated['user'] = self.context['request'].user
        # 若你要立即 geocode，可在這裡呼叫服務並填 lat/lng/ formatted_address / place_id
        from common.services.geocode import geocode_address
        if addr := validated.get('address'):
            if data := geocode_address(addr):
                validated.update({
                    'formatted_address': data['formatted_address'],
                    'place_id': data.get('place_id', ''),
                    'lat': data['lat'],
                    'lng': data['lng'],
                    'geocoded_at': timezone.now(),
                })
        return super().create(validated)
