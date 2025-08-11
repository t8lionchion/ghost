from django.db import models
from accounts.models import Users
from events.models import Activity_Form
# Create your models here.

class LotteryEntry(models.Model):
    user = models.ForeignKey(Users, on_delete=models.CASCADE,
                             related_name='lottery_entries')
    activity = models.ForeignKey(Activity_Form, on_delete=models.CASCADE,
                                 related_name='lottery_entries')
    is_winning = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    prize=models.CharField(max_length=128)
    times=models.IntegerField()
    class Meta:
        indexes = [
            models.Index(fields=['activity', 'is_winning']),
            models.Index(fields=['user', 'activity', 'created_at']),
        ]
        ordering = ['-created_at']
    def __str__(self):
         return f"user={self.user_id}, activity={self.activity_id}, status={'中獎' if self.is_winning else '未中'}, at={self.created_at:%Y-%m-%d %H:%M:%S}"