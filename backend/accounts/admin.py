from django.contrib import admin, messages
from .models import Users, RoleStatus
# 可自訂後台標題（中文）
from django.contrib import admin


@admin.register(Users)
class UsersAdmin(admin.ModelAdmin):
    list_display = (
        "username", "account", "email", "role", "isActive",
        "created_at", "update_at", "last_login_at",
    )
    list_filter = ("isActive", "role", "created_at")
    search_fields = ("username", "account", "email")
    readonly_fields = ("created_at", "update_at", "last_login_at")
    ordering = ("-created_at",)

    fieldsets = (
        ("基本資料", {"fields": ("username", "email", "account", "password")}),
        ("權限與狀態", {"fields": ("role", "isActive")}),
        ("時間戳記", {"fields": ("created_at", "update_at", "last_login_at")}),
    )

    # ---- 自訂批次動作（軟刪除 / 恢復） ----
    @admin.action(description="停用所選帳戶（軟刪除）")
    def soft_delete_users(self, request, queryset):
        updated = queryset.update(isActive=False)
        self.message_user(request, f"已停用 {updated} 筆帳戶。", level=messages.SUCCESS)

    @admin.action(description="恢復所選帳戶")
    def restore_users(self, request, queryset):
        updated = queryset.update(isActive=True)
        self.message_user(request, f"已恢復 {updated} 筆帳戶。", level=messages.SUCCESS)

    actions = ["soft_delete_users", "restore_users"]

    # ---- 停用硬刪除（避免真的刪 DB 資料）----
    def has_delete_permission(self, request, obj=None):
        return False

    def get_actions(self, request):
        actions = super().get_actions(request)
        # 同時移除原生「刪除所選資料」動作（防呆）
        if "delete_selected" in actions:
            del actions["delete_selected"]
        return actions
