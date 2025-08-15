from django.db import models,IntegrityError,transaction
from accounts.models import Users

# 活動表單
class Activity_Form(models.Model):
    Activity_name = models.CharField("活動名稱", max_length=128)
    Activity_start_date = models.DateTimeField("開始時間")
    Activity_end_date = models.DateTimeField("結束時間")
    address = models.CharField("地址", max_length=1024)
    descripe = models.CharField("活動介紹", max_length=1024)
    isActive = models.BooleanField("啟用中", default=True)

    # 抽獎控制
    lottery_quota = models.PositiveIntegerField("中獎名額", default=3)
    lottery_drawn = models.BooleanField("是否已抽過", default=False)
    lottery_done_at = models.DateTimeField("開獎時間", null=True, blank=True)

    class Meta:
        verbose_name = "活動"
        verbose_name_plural = "活動"

    def __str__(self):
        return self.Activity_name


# 活動題目
class Active_questions(models.Model):
    active = models.ForeignKey(
        Activity_Form,
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name="questions",
        verbose_name="所屬活動",
    )
    question_text = models.CharField("題目文字", max_length=1024)
    options_id = models.IntegerField("選項群組ID", unique=True)
    sort_order = models.IntegerField("題目排序")
    answer = models.CharField("正確答案（填選項值）", max_length=128)
    created_at = models.DateTimeField("建立時間", auto_now_add=True)
    update_at = models.DateTimeField("更新時間", auto_now=True)

    class Meta:
        verbose_name = "題目"
        verbose_name_plural = "題目"
        ordering = ["active", "sort_order"]

    def __str__(self):
        return self.question_text
    def save(self, *args, **kwargs):
        # 最多重試 5 次，避免偶發撞號
        retries = 5
        while retries > 0:
            try:
                with transaction.atomic():
                    # 1) options_id：全域流水，至少從 1 開始
                    if not self.options_id or self.options_id <= 0:
                        last = (Active_questions.objects
                                .select_for_update()
                                .order_by("-options_id")
                                .only("options_id")
                                .first())
                        self.options_id = (last.options_id + 1) if last else 1

                    # 2) sort_order：同活動內流水，至少從 1 開始
                    if not self.sort_order or self.sort_order <= 0:
                        last_q = (Active_questions.objects
                                  .filter(active=self.active)
                                  .select_for_update()
                                  .order_by("-sort_order")
                                  .only("sort_order")
                                  .first())
                        self.sort_order = (last_q.sort_order + 1) if last_q else 1

                    # 3) 存檔同在交易裡，確保一致
                    return super().save(*args, **kwargs)

            except IntegrityError:
                # 可能剛好和別筆同時取到同一個最大值 → 重試一次
                self.options_id = None
                retries -= 1

        # 仍失敗就丟錯（讓你看到問題而不是悄悄吞掉）
        return super().save(*args, **kwargs)



# 題目選項
class Active_question_options(models.Model):
    options = models.ForeignKey(
        Active_questions,
        on_delete=models.CASCADE,
        related_name='options_by_options_id',
        null=True, blank=True,
        verbose_name="所屬題目",
    )
    option_label = models.CharField("選項文字", max_length=64)
    option_value = models.CharField("選項值", max_length=1024)
    sort_order = models.IntegerField("排序")

    class Meta:
        verbose_name = "選項"
        verbose_name_plural = "選項"
        ordering = ["options", "sort_order"]

    def __str__(self):
        # 原本打成 options_label 會報錯，這裡修正
        return self.option_label or f"選項#{self.pk}"
    def save(self, *args, **kwargs):
        # 只在新增時才給 sort_order，避免後續手動調整被覆蓋
        if self.sort_order is None:
            # 找出該題目前最大 sort_order
            last_sort = (
                Active_question_options.objects
                .filter(options=self.options)
                .aggregate(models.Max("sort_order"))
                .get("sort_order__max") or 0
            )
            self.sort_order = last_sort + 1
        super().save(*args, **kwargs)


# 定位 Gate
class GeoCheckpoint(models.Model):
    activity = models.ForeignKey('Activity_Form', on_delete=models.CASCADE, related_name='checkpoints', verbose_name="活動")
    order = models.PositiveSmallIntegerField("關卡序號", default=1)
    title = models.CharField("標題", max_length=128, blank=True, default="")
    lat = models.FloatField("緯度")
    lng = models.FloatField("經度")
    radius_m = models.PositiveIntegerField("半徑（公尺）", default=80)

    class Meta:
        verbose_name = "定位 Gate"
        verbose_name_plural = "定位 Gate"
        unique_together = ('activity', 'order')
        indexes = [models.Index(fields=['activity', 'order'])]
        ordering = ['order']

    def __str__(self):
        return f'{self.activity.Activity_name} / gate#{self.order} r={self.radius_m}m'


# 使用者進度
class UserProgress(models.Model):
    user = models.ForeignKey(Users, on_delete=models.CASCADE, related_name='activity_progress', verbose_name="使用者")
    activity = models.ForeignKey('Activity_Form', on_delete=models.CASCADE, related_name='user_progress', verbose_name="活動")
    unlocked_stage = models.PositiveSmallIntegerField("已解鎖階段", default=0)
    last_checkin_at = models.DateTimeField("最後打卡時間", auto_now=True)
    last_lat = models.FloatField("上次緯度", null=True, blank=True)
    last_lng = models.FloatField("上次經度", null=True, blank=True)

    class Meta:
        verbose_name = "使用者進度"
        verbose_name_plural = "使用者進度"
        unique_together = ('user', 'activity')
        indexes = [
            models.Index(fields=['user', 'activity']),
            models.Index(fields=['activity', 'unlocked_stage']),
        ]

    def __str__(self):
        return f'u{self.user_id} @ {self.activity.Activity_name}: unlocked={self.unlocked_stage}'
