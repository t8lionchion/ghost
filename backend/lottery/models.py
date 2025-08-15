from django.db import models
from accounts.models import Users
from events.models import Activity_Form

class LotteryEntry(models.Model):
    user = models.ForeignKey(
        Users, on_delete=models.CASCADE,
        related_name='lottery_entries',
        verbose_name="使用者",
    )
    activity = models.ForeignKey(
        Activity_Form, on_delete=models.CASCADE,
        related_name='lottery_entries',
        verbose_name="活動",
    )
    is_winning = models.BooleanField("是否中獎", default=False)
    created_at = models.DateTimeField("抽獎時間", auto_now_add=True)
    prize = models.CharField("獎項", max_length=128)
    times = models.IntegerField("抽獎次數")
    is_joined = models.BooleanField("是否參加", default=True)

    class Meta:
        verbose_name = "抽獎紀錄"
        verbose_name_plural = "抽獎紀錄"
        indexes = [
            models.Index(fields=['activity', 'is_winning']),
            models.Index(fields=['user', 'activity', 'created_at']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        state = "中獎" if self.is_winning else "未中"
        return f"{self.user.username}／{self.activity.Activity_name}／{state}／{self.created_at:%Y-%m-%d %H:%M:%S}"
