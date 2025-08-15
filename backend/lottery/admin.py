from django.contrib import admin
from django.utils.html import format_html
from django.http import HttpResponse
import csv

from .models import LotteryEntry

# ===== 共用欄位呈現（中文） =====
class BaseLotteryAdmin(admin.ModelAdmin):
    list_display = (
        "user_name",          # 使用者
        "activity_name",      # 活動
        "prize",              # 獎品
        "times",              # 抽獎次數
        "joined_badge",       # 參加狀態
        "winning_badge",      # 中獎狀態
        "created_at_fmt",     # 抽獎時間
    )
    list_filter = ("activity", "is_winning", "is_joined", "created_at")
    search_fields = ("user__username", "user__account", "activity__Activity_name", "prize")
    ordering = ("-created_at",)
    readonly_fields = ("created_at",)

    # --- 中文欄位方法 ---
    def user_name(self, obj):
        return obj.user.username
    user_name.short_description = "使用者"

    def activity_name(self, obj):
        return obj.activity.Activity_name
    activity_name.short_description = "活動"

    def winning_badge(self, obj):
        if obj.is_winning:
            return format_html('<span style="background:#198754;color:#fff;padding:2px 8px;border-radius:8px;">中獎</span>')
        return format_html('<span style="background:#6c757d;color:#fff;padding:2px 8px;border-radius:8px;">未中</span>')
    winning_badge.short_description = "中獎狀態"

    def joined_badge(self, obj):
        if obj.is_joined:
            return format_html('<span style="background:#0d6efd;color:#fff;padding:2px 8px;border-radius:8px;">已參加</span>')
        return format_html('<span style="background:#6c757d;color:#fff;padding:2px 8px;border-radius:8px;">未參加</span>')
    joined_badge.short_description = "參加狀態"

    def created_at_fmt(self, obj):
        return obj.created_at.strftime("%Y-%m-%d %H:%M")
    created_at_fmt.short_description = "抽獎時間"

    # --- 匯出中獎名單 CSV（所選或目前篩選結果） ---
    @admin.action(description="匯出為 CSV（中獎名單）")
    def export_winners_csv(self, request, queryset):
        qs = queryset.filter(is_winning=True)
        resp = HttpResponse(content_type="text/csv; charset=utf-8")
        resp["Content-Disposition"] = 'attachment; filename="winners.csv"'
        writer = csv.writer(resp)
        writer.writerow(["使用者", "活動", "獎品", "抽獎次數", "抽獎時間"])
        for e in qs.select_related("user", "activity"):
            writer.writerow([
                e.user.username,
                e.activity.Activity_name,
                e.prize,
                e.times,
                e.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            ])
        return resp

    actions = ["export_winners_csv"]


# 1) 一般「抽獎紀錄」後台（全部）
@admin.register(LotteryEntry)
class LotteryEntryAdmin(BaseLotteryAdmin):
    pass


# 2) 代理模型：中獎名單（只顯示 is_winning=True）
class WinningEntry(LotteryEntry):
    class Meta:
        proxy = True
        verbose_name = "中獎名單"
        verbose_name_plural = "中獎名單"

@admin.register(WinningEntry)
class WinningEntryAdmin(BaseLotteryAdmin):
    # 預設只看中獎
    def get_queryset(self, request):
        return super().get_queryset(request).filter(is_winning=True)

    # 中獎名單就不需要再篩「中獎狀態」
    def get_list_filter(self, request):
        return ("activity", "is_joined", "created_at")
