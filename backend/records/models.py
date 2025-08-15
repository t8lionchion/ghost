from django.db import models
from django.utils import timezone
from accounts.models import Users

class EventLevel(models.IntegerChoices):
    LOW = 1, "低"
    MEDIUM = 2, "中"
    HIGH = 3, "高"

class ReviewStatus(models.IntegerChoices):
    PENDING  = 1, "待審核"
    APPROVED = 2, "已通過"
    REJECTED = 3, "已退回"

class Event_Record(models.Model):
    user  = models.ForeignKey(Users, on_delete=models.CASCADE, related_name='event_records', verbose_name="上報者")
    event_name   = models.CharField("事件名稱", max_length=128)
    event_image  = models.ImageField("事件圖片", upload_to='events/', blank=True, null=True)

    address            = models.CharField("使用者輸入地址", max_length=255)
    formatted_address  = models.CharField("正規化地址", max_length=255, blank=True)
    place_id           = models.CharField("Place ID", max_length=128, blank=True)
    lat = models.DecimalField("緯度", max_digits=9, decimal_places=6, null=True, blank=True)
    lng = models.DecimalField("經度", max_digits=9, decimal_places=6, null=True, blank=True)
    geocoded_at       = models.DateTimeField("地理編碼時間", null=True, blank=True)

    event_occurs_time = models.DateTimeField("事件發生時間")
    is_active  = models.BooleanField("顯示在地圖", default=False)  # 是否公開
    level      = models.IntegerField("等級", choices=EventLevel.choices, default=EventLevel.LOW)
    descriptions = models.CharField("事件描述", max_length=1028)

    # ⬇️ 新增：審核與軟刪除
    review_status = models.IntegerField("審核狀態", choices=ReviewStatus.choices, default=ReviewStatus.PENDING)
    is_deleted    = models.BooleanField("已軟刪除", default=False)
    deleted_at    = models.DateTimeField("刪除時間", null=True, blank=True)

    created_at = models.DateTimeField("建立時間", auto_now_add=True)
    updated_at = models.DateTimeField("更新時間", auto_now=True)

    class Meta:
        verbose_name = "上報事件"
        verbose_name_plural = "上報事件"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['place_id']),
            models.Index(fields=['lat', 'lng']),
            models.Index(fields=['is_active', 'level']),
            models.Index(fields=['review_status', 'is_deleted']),
        ]
        constraints = [
            models.CheckConstraint(
                name='lat_lng_both_null_or_both_set',
                check=(
                    (models.Q(lat__isnull=True) & models.Q(lng__isnull=True)) |
                    (models.Q(lat__isnull=False) & models.Q(lng__isnull=False))
                ),
            ),
        ]

    def __str__(self):
        return f"{self.event_name}（#{self.pk}）"

    def soft_delete(self):
        self.is_deleted = True
        self.is_active = False
        self.deleted_at = timezone.now()
        self.save(update_fields=['is_deleted', 'is_active', 'deleted_at'])

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])

    # 可選：save 時自動 geocode（如你原先）
    def save(self, *args, **kwargs):
        if self.address and (self.lat is None or self.lng is None):
            try:
                from common.services.geocode import geocode_address
                data = geocode_address(self.address)
                if data:
                    self.formatted_address = data["formatted_address"]
                    self.place_id = data.get("place_id", "")
                    self.lat = data["lat"]
                    self.lng = data["lng"]
                    self.geocoded_at = timezone.now()
            except Exception:
                pass
        super().save(*args, **kwargs)


class EventRecordDeleted(Event_Record):
    class Meta:
        proxy = True
        verbose_name = "已軟刪除事件"
        verbose_name_plural = "已軟刪除事件"
