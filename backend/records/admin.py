from django.contrib import admin, messages
from django.utils.html import format_html
from django.utils import timezone
from .models import Event_Record, EventLevel, ReviewStatus, EventRecordDeleted

@admin.register(Event_Record)
class EventRecordAdmin(admin.ModelAdmin):
    list_display = (
        "event_name", "user", "level_badge", "review_status_badge",
        "is_active", "is_deleted", "created_at", "map_link",
        "thumb",
    )
    list_filter = (
        "review_status", "is_deleted", "is_active", "level", "created_at",
    )
    search_fields = ("event_name", "address", "formatted_address", "user__username", "place_id")
    readonly_fields = ("created_at", "updated_at", "geocoded_at", "deleted_at", "thumb")
    ordering = ("-created_at",)

    fieldsets = (
        ("基本資訊", {
            "fields": ("event_name", "event_image", "thumb", "descriptions", "level")
        }),
        ("地點資訊", {
            "fields": ("address", "formatted_address", "place_id", "lat", "lng", "geocoded_at")
        }),
        ("審核與狀態", {
            "fields": ("review_status", "is_active", "is_deleted", "deleted_at")
        }),
        ("其他", {
            "fields": ("user", "event_occurs_time", "created_at", "updated_at")
        }),
    )
    class Media:
        css = {'all': ('css/admin_overrides.css',)}

    # 預設不顯示已刪除
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # 讓管理員仍可透過篩選看到已刪除（list_filter 有 is_deleted）
        return qs.filter(is_deleted=False) if 'is_deleted__exact' not in request.GET else qs

    # 自訂顯示：等級徽章
    def level_badge(self, obj):
        color = {1: "#198754", 2: "#fd7e14", 3: "#dc3545"}.get(obj.level, "#6c757d")
        label = obj.get_level_display()
        return format_html('<span style="color:#fff;background:{};padding:2px 8px;border-radius:8px;font-size:12px;">{}</span>', color, label)
    level_badge.short_description = "等級"

    # 自訂顯示：審核狀態徽章
    def review_status_badge(self, obj):
        color = {ReviewStatus.PENDING: "#0d6efd", ReviewStatus.APPROVED: "#198754", ReviewStatus.REJECTED: "#dc3545"}.get(obj.review_status, "#6c757d")
        label = obj.get_review_status_display()
        return format_html('<span style="color:#fff;background:{};padding:2px 8px;border-radius:8px;font-size:12px;">{}</span>', color, label)
    review_status_badge.short_description = "審核狀態"

    # 縮圖
    def thumb(self, obj):
        if not obj.event_image:
            return "-"
        return format_html('<img src="{}" style="height:56px;border-radius:6px;" />', obj.event_image.url)
    thumb.short_description = "縮圖預覽"

    # Google Maps 連結
    def map_link(self, obj):
        if obj.lat is None or obj.lng is None:
            return "-"
        return format_html('<a href="https://www.google.com/maps?q={},{}" target="_blank">在地圖檢視</a>', obj.lat, obj.lng)
    map_link.short_description = "地圖"

    # ---- 批次動作 ----
    @admin.action(description="通過審核（顯示於地圖）")
    def approve_selected(self, request, queryset):
        updated = queryset.update(review_status=ReviewStatus.APPROVED, is_active=True)
        self.message_user(request, f"已通過 {updated} 筆事件並顯示於地圖。", level=messages.SUCCESS)

    @admin.action(description="退回（隱藏於地圖）")
    def reject_selected(self, request, queryset):
        updated = queryset.update(review_status=ReviewStatus.REJECTED, is_active=False)
        self.message_user(request, f"已退回 {updated} 筆事件，並自地圖隱藏。", level=messages.WARNING)

    @admin.action(description="軟刪除（不顯示於列表）")
    def soft_delete_selected(self, request, queryset):
        updated = 0
        for obj in queryset:
            if not obj.is_deleted:
                obj.is_active = False
                obj.is_deleted = True
                obj.deleted_at = timezone.now()
                obj.save(update_fields=['is_active', 'is_deleted', 'deleted_at'])
                updated += 1
        self.message_user(request, f"已軟刪除 {updated} 筆事件。", level=messages.SUCCESS)

    @admin.action(description="恢復軟刪除")
    def restore_selected(self, request, queryset):
        updated = queryset.filter(is_deleted=True).update(is_deleted=False, deleted_at=None)
        self.message_user(request, f"已恢復 {updated} 筆事件。", level=messages.SUCCESS)

    actions = ["approve_selected", "reject_selected", "soft_delete_selected", "restore_selected"]

    # 停用硬刪除（避免誤刪 DB）
    def has_delete_permission(self, request, obj=None):
        return False

    def get_actions(self, request):
        actions = super().get_actions(request)
        if "delete_selected" in actions:
            del actions["delete_selected"]
        return actions
    



@admin.register(EventRecordDeleted)
class EventRecordDeletedAdmin(admin.ModelAdmin):
    # 跟原列表差不多，但只看 is_deleted=True，並以「恢復」為主
    list_display = (
        "event_name", "user", "level_badge", "is_active_badge",
        "created_at", "map_link", "thumb",
    )
    # 這個清單就不用 is_deleted 篩選了，避免混淆
    list_filter = ("is_active", "level", "created_at")
    search_fields = ("event_name", "address", "formatted_address", "user__username", "place_id")
    readonly_fields = ("created_at", "updated_at", "geocoded_at", "thumb")
    ordering = ("-created_at",)

    fieldsets = (
        ("基本資訊", {"fields": ("event_name", "event_image", "thumb", "descriptions", "level")}),
        ("地點資訊", {"fields": ("address", "formatted_address", "place_id", "lat", "lng", "geocoded_at")}),
        ("審核與狀態", {"fields": ("is_active",)}),
        ("其他", {"fields": ("user", "event_occurs_time", "created_at", "updated_at")}),
    )

    # 只抓已軟刪除資料
    def get_queryset(self, request):
        # 別呼叫你原本 EventRecordAdmin.get_queryset（會過濾掉刪除）
        qs = self.model._default_manager.all()
        return qs.filter(is_deleted=True)

    # 復用你在主 Admin 的顯示方法（複製或從那邊提取共用）
    def level_badge(self, obj):
        color = {1: "#198754", 2: "#fd7e14", 3: "#dc3545"}.get(obj.level, "#6c757d")
        return format_html('<span style="color:#fff;background:{};padding:2px 8px;border-radius:8px;font-size:12px;">{}</span>',
                           color, obj.get_level_display())
    level_badge.short_description = "等級"

    def is_active_badge(self, obj):
        if obj.is_active:
            return format_html('<span style="color:#fff;background:#198754;padding:2px 8px;border-radius:8px;font-size:12px;">已審核/顯示中</span>')
        return format_html('<span style="color:#fff;background:#6c757d;padding:2px 8px;border-radius:8px;font-size:12px;">未審核/已下架</span>')
    is_active_badge.short_description = "審核狀態"

    def thumb(self, obj):
        if not obj.event_image:
            return "-"
        return format_html('<img src="{}" style="height:56px;border-radius:6px;" />', obj.event_image.url)
    thumb.short_description = "縮圖預覽"

    def map_link(self, obj):
        if obj.lat is None or obj.lng is None:
            return "-"
        return format_html('<a href="https://www.google.com/maps?q={},{}" target="_blank">在地圖檢視</a>', obj.lat, obj.lng)
    map_link.short_description = "地圖"

    # 只保留「恢復」動作（也可加通過/下架，但通常先恢復再處理）
    @admin.action(description="恢復軟刪除")
    def restore_selected(self, request, queryset):
        updated = queryset.update(is_deleted=False)
        self.message_user(request, f"已恢復 {updated} 筆事件。", level=messages.SUCCESS)

    actions = ["restore_selected"]

    # 仍然避免硬刪除
    def has_delete_permission(self, request, obj=None):
        return False

    def get_actions(self, request):
        actions = super().get_actions(request)
        if "delete_selected" in actions:
            del actions["delete_selected"]
        return actions
