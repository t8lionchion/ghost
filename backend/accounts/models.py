from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
# Create your models here.

class RoleStatus(models.IntegerChoices):
    normal=1,"normal"
    vip=2,"vip"
    admin=3,"admin"


class Users(models.Model):
    username=models.CharField(max_length=1024)
    email=models.CharField(max_length=256,null=True,unique=True)
    account=models.CharField(max_length=1024,unique=True)
    password=models.CharField(max_length=1024)
    role=models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        choices=RoleStatus.choices,
        default=RoleStatus.normal,
    )
    isActive=models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    update_at=models.DateTimeField(auto_now=True)
    last_login_at=models.DateTimeField(auto_now=True)
    @property
    def is_authenticated(self):
        return True  # 被 JWT 認證後，DRF 會把你塞到 request.user
    def __str__(self):
        return self.username