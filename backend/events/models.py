from django.db import models
from accounts.models import Users
# Create your models here.
#活動表單建立
class Activity_Form(models.Model):
    Activity_name=models.CharField(max_length=128)
    Activity_start_date=models.DateTimeField()
    Activity_end_date=models.DateTimeField()
    address=models.CharField(max_length=1024)
    descripe=models.CharField(max_length=1024)
    def __str__(self):
        return self.Activity_name
#活動表單裡面的題目建立
class Active_questions(models.Model):
    active=models.ForeignKey(
        Activity_Form,
        on_delete=models.CASCADE,
        null=True, blank=True,           # ★ 第一次遷移先放寬
        related_name="questions",
    )
    question_text=models.CharField(max_length=1024)
    options_id=models.IntegerField(unique=True)
    sort_order=models.IntegerField()
    answer=models.CharField(max_length=128)
    created_at=models.DateTimeField(auto_now_add=True)
    update_at=models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.question_text
#表單題目的4個選項建立
class Active_question_options(models.Model):
     options = models.ForeignKey(
        Active_questions,
        on_delete=models.CASCADE,
        related_name='options_by_options_id',
        null=True, blank=True      # ← 先允許 NULL 才不會卡遷移
    )
     option_label=models.CharField(max_length=64) #// 顯示的選項文字 
     option_value=models.CharField(max_length=1024) # 顯示的選項實際值 
     sort_order=models.IntegerField() #顯示選項的順序
     def __str__(self):
        return self.options_label


class GeoCheckpoint(models.Model):
    """
    單一地點 Gate（你要「到點就能一口氣完成表單」）
    實務上只會用 order=1 這一筆；保留 order 是為了未來你想擴到多點也不需改 schema
    """
    activity = models.ForeignKey(
        'Activity_Form', on_delete=models.CASCADE, related_name='checkpoints'
    )
    order = models.PositiveSmallIntegerField(default=1)   # 單點模式一律 1
    title = models.CharField(max_length=128, blank=True, default="")
    lat = models.FloatField()
    lng = models.FloatField()
    radius_m = models.PositiveIntegerField(default=80)    # 建議 80~120 視場地

    class Meta:
        unique_together = ('activity', 'order')
        indexes = [
            models.Index(fields=['activity', 'order']),
        ]
        ordering = ['order']

    def __str__(self):
        return f'{self.activity.Activity_name} / gate#{self.order} r={self.radius_m}m'


class UserProgress(models.Model):
    """
    使用者是否已通過 Gate 的狀態
    單點模式：unlocked_stage >= 1 代表「已到點驗證通過」
    """
    user = models.ForeignKey(
        Users, on_delete=models.CASCADE, related_name='activity_progress'
    )
    activity = models.ForeignKey(
        'Activity_Form', on_delete=models.CASCADE, related_name='user_progress'
    )
    unlocked_stage = models.PositiveSmallIntegerField(default=0)  # 0=未通過 gate；>=1 已通過
    last_checkin_at = models.DateTimeField(auto_now=True)
    last_lat = models.FloatField(null=True, blank=True)
    last_lng = models.FloatField(null=True, blank=True)
    # 新增：存放該使用者在該活動的累計抽獎次數
    lottery_times = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('user', 'activity')
        indexes = [
            models.Index(fields=['user', 'activity']),
            models.Index(fields=['activity', 'unlocked_stage']),
        ]

    def __str__(self):
        return f'u{self.user_id} @ {self.activity.Activity_name}: unlocked={self.unlocked_stage}'
