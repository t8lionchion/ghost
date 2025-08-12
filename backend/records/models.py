from django.db import models
from django.utils import timezone
from accounts.models import Users

class EventLevel(models.IntegerChoices):
    LOW = 1, "低"
    MEDIUM = 2, "中"
    HIGH = 3, "高"

class Event_Record(models.Model):
    user = models.ForeignKey(
        Users,
        on_delete=models.CASCADE,
        related_name='event_records',  # 複數，語意更好
    )
    event_name = models.CharField(max_length=128)
    # 上傳檔案用 ImageField；若只存 URL 改用 URLField
    event_image = models.ImageField(upload_to='events/', blank=True, null=True)

    # 地址與地理編碼
    address = models.CharField(max_length=255)                     # 使用者原始輸入
    formatted_address = models.CharField(max_length=255, blank=True)  # Google 正規化
    place_id = models.CharField(max_length=128, blank=True)        # 方便快取/查詢
    lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    geocoded_at = models.DateTimeField(null=True, blank=True)

    # 事件資訊
    event_occurs_time = models.DateTimeField()
    is_active = models.BooleanField(default=False)  # 是否公開/審核通過
    level = models.IntegerField(choices=EventLevel.choices, default=EventLevel.LOW)
    descriptions=models.CharField(max_length=1028)
    # 共同欄位
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['place_id']),
            models.Index(fields=['lat', 'lng']),
            models.Index(fields=['is_active', 'level']),
        ]
        constraints = [
            # lat 與 lng 必須同時為空或同時有值（避免只存一邊）
            models.CheckConstraint(
                name='lat_lng_both_null_or_both_set',
                check=(
                    (models.Q(lat__isnull=True) & models.Q(lng__isnull=True)) |
                    (models.Q(lat__isnull=False) & models.Q(lng__isnull=False))
                ),
            ),
        ]

    def __str__(self):
        return f"{self.event_name} by {self.user_id}"

    # 可選：在 save 時自動補 geocode（也可改放 Celery）
    def save(self, *args, **kwargs):
        if self.address and (self.lat is None or self.lng is None):
            try:
                from common.services.geocode import geocode_address  # 你前面已做的 service
                data = geocode_address(self.address)
                if data:
                    self.formatted_address = data["formatted_address"]
                    self.place_id = data.get("place_id", "")
                    self.lat = data["lat"]
                    self.lng = data["lng"]
                    self.geocoded_at = timezone.now()
            except Exception:
                # 失敗就先讓它存，之後用管理指令批次補
                pass
        super().save(*args, **kwargs)
