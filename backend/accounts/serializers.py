from accounts.models import Users
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

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
    
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    username = None
    account = serializers.CharField()
    password = serializers.CharField(write_only=True)

    class Meta:
        fields = ('account', 'password')

    def to_internal_value(self, data):
        # 只解析 account 和 password，避免調用父類處理 username
        account = data.get('account')
        password = data.get('password')

        if account is None:
            raise serializers.ValidationError({"account": "此欄位為必填。"})

        if password is None:
            raise serializers.ValidationError({"password": "此欄位為必填。"})

        return {'account': account, 'password': password}

    def validate(self, attrs):
        account = attrs.get("account")
        password = attrs.get("password")

        try:
            user_obj = Users.objects.get(account=account)
        except Users.DoesNotExist:
            raise serializers.ValidationError({"account": "帳號不存在"})

        if not check_password(password, user_obj.password):
            raise serializers.ValidationError({"password": "密碼錯誤"})

        if not user_obj.isActive:
            raise serializers.ValidationError({"account": "此帳號已停用"})

        refresh = self.get_token(user_obj)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['account'] = user.account
        token['role'] = user.role
        return token


class MyTokenRefreshSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate(self, attrs):
        refresh_token = attrs.get("refresh")

        try:
            refresh = RefreshToken(refresh_token)
            access = refresh.access_token

            # ✅ 可以在這裡加入自訂 payload，例如：
            user = refresh.get("id")
            access["token_type"] = "access"

            return {
                "access": str(access),
            }
        except TokenError:
            raise serializers.ValidationError({"refresh": "Refresh Token 無效或已過期"})