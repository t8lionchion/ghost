from accounts.models import Users
from rest_framework import serializers
from django.contrib.auth.hashers import make_password

class UsersSerializers(serializers.ModelSerializer):
    class Meta:
        model = Users   
        fields = ['username','email','account','password']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    def validate_account(self, value):
        if Users.objects.filter(account=value).exists():
            raise serializers.ValidationError("帳號已存在")
        return value
    def validate_email(self,value):
        if Users.objects.filter(email=value).exists():
            raise serializers.ValidationError("電子信箱已存在")
        return value
    def create(self, validated_data):
        # 如果你要儲存雜湊後的密碼，請自行處理。例如：
        password = validated_data.pop('password')
        user = Users(**validated_data)
        # 假設你用 django.contrib.auth.hashers.hash_password
        from django.contrib.auth.hashers import make_password
        user.password = make_password(password)
        user.save()
        return user
    