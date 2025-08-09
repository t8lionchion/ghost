from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import exceptions
from accounts.models import Users  # 你的自訂使用者 model

class MyJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user_id = validated_token.get("user_id")
        account = validated_token.get("account")

        # 先用 id 找，不行再用 account 找（兩者擇一即可）
        user = None
        if user_id is not None:
            try:
                user = Users.objects.get(id=user_id)
            except Users.DoesNotExist:
                pass
        if user is None and account:
            try:
                user = Users.objects.get(account=account)
            except Users.DoesNotExist:
                pass

        if user is None:
            raise exceptions.AuthenticationFailed(
                {"detail": "User not found", "code": "user_not_found"},
                code="user_not_found",
            )
        # 若你有停用欄位
        if hasattr(user, "isActive") and not user.isActive:
            raise exceptions.AuthenticationFailed(
                {"detail": "User inactive", "code": "user_inactive"},
                code="user_inactive",
            )
        return user
