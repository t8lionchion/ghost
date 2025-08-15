from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator

class RoleStatus(models.IntegerChoices):
    normal = 1, "一般"
    vip    = 2, "VIP"
    admin  = 3, "管理員"

class Users(models.Model):
    username = models.CharField("使用者名稱", max_length=1024)
    email    = models.CharField("電子信箱", max_length=256, null=True, unique=True)
    account  = models.CharField("帳號", max_length=1024, unique=True)
    password = models.CharField("密碼（雜湊）", max_length=1024)
    role     = models.IntegerField(
        "角色",
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        choices=RoleStatus.choices,
        default=RoleStatus.normal,
    )
    isActive     = models.BooleanField("啟用中", default=True)
    created_at   = models.DateTimeField("建立時間", auto_now_add=True)
    update_at    = models.DateTimeField("更新時間", auto_now=True)
    last_login_at= models.DateTimeField("上次登入時間", auto_now=True)  # 建議改成手動更新

    class Meta:
        verbose_name = "使用者"
        verbose_name_plural = "使用者"

    @property
    def is_authenticated(self):
        return True

    def __str__(self):
        return f"{self.username}（{self.account}）"
