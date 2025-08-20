from django.contrib import admin, messages
from django import forms
from django.forms.models import BaseInlineFormSet
from .models import (
    Activity_Form, Active_questions, Active_question_options,
    GeoCheckpoint, UserProgress
)
from django.db import transaction
from nested_admin import NestedModelAdmin, NestedStackedInline, NestedTabularInline
# ✅ 使用你的定位函式（匯入路徑請依你檔案實際位置調整）
from common.services.geocode import geocode_address  # 例如 common/services/geocode.py
from services.lottery import draw_winners_for_activity
# ========= 巢狀 Inline =========

# --- 選項（每題固定 4 個，可拖曳 sort_order） ---

class OptionInline(NestedTabularInline):
    model = Active_question_options
    fields = ("option_label", "option_value", "sort_order")
    extra = 4
    min_num = 4
    max_num = 4
    validate_min = True
    validate_max = True
    sortable_field_name = "sort_order"
    verbose_name = "選項"
    verbose_name_plural = "選項（固定 4 個）"

# --- 題目（可新增多題；內含 4 個選項表格） ---
class QuestionInline(NestedStackedInline):
    model = Active_questions
    fields = ("question_text", "answer")
    extra = 1                      # 讓你「新增其它 題目」
    inlines = [OptionInline]
    
    verbose_name = "題目"
    verbose_name_plural = "題目"

# --- Gate（非重點，但保留） ---
class GeoCheckpointInline(NestedTabularInline):
    model = GeoCheckpoint
    fields = ("order", "title", "lat", "lng", "radius_m")
    extra = 0
    max_num = 1
    verbose_name = "定位 Gate"
    verbose_name_plural = "定位 Gate"




@admin.register(Activity_Form)
class ActivityAdmin(NestedModelAdmin):
    list_display = ("Activity_name", "Activity_start_date", "Activity_end_date",
                    "isActive", "lottery_quota", "lottery_drawn",
                    )
    list_filter = ("isActive", "lottery_drawn", "Activity_start_date", "Activity_end_date")
    search_fields = ("Activity_name", "address", "descripe")
    actions = ["run_lottery", "geocode_selected"]
    # 這裡一次帶三層：活動 → 題目 → 選項；以及 Gate
    inlines = [QuestionInline, GeoCheckpointInline]
    def get_actions(self, request):
        actions = super().get_actions(request)
        print("ADMIN ACTIONS:", list(actions.keys()))  # 到 journalctl 觀看
        return actions
    @admin.action(description="抽出得獎者")
    def run_lottery(self, request, queryset):
        done, skipped = 0, 0
        with transaction.atomic():
            for act in queryset.select_for_update():
                if getattr(act, "lottery_drawn", False):
                    skipped += 1
                    continue
                winners = draw_winners_for_activity(act)
                act.lottery_drawn = True
                act.save(update_fields=["lottery_drawn"])
                done += 1
        if done:
            self.message_user(request, f"完成 {done} 筆抽獎。", level=messages.SUCCESS)
        if skipped:
            self.message_user(request, f"略過 {skipped} 筆（已抽過）。", level=messages.INFO)

    # --- 批次動作：重新定位 Gate（依地址） ---
    @admin.action(description="重新定位 Gate（依地址）")
    def geocode_selected(self, request, queryset):
        ok = fail = 0
        for obj in queryset:
            addr = (obj.address or "").strip()
            if not addr:
                fail += 1
                continue
            try:
                geo = geocode_address(addr)
            except Exception as e:
                self.message_user(request, f"[{obj.Activity_name}] 定位服務錯誤：{e}", level=messages.ERROR)
                fail += 1
                continue

            if not geo:
                fail += 1
                continue

            cp, created = GeoCheckpoint.objects.get_or_create(
                activity=obj, order=1,
                defaults={"title": "集合點", "lat": geo["lat"], "lng": geo["lng"], "radius_m": 80},
            )
            if not created:
                cp.lat = geo["lat"]; cp.lng = geo["lng"]
                if not cp.title:
                    cp.title = "集合點"
                cp.save(update_fields=["lat", "lng", "title"])
            ok += 1

        self.message_user(request, f"定位成功 {ok} 筆，失敗 {fail} 筆。", level=messages.INFO)

    
    

    # --- 儲存活動時自動定位（新增與編輯都會觸發） ---
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)

        # 只有在地址有填，且「第一次建立 Gate」或「地址有變更」時才定位
        need_geocode = False
        if obj.address:
            has_gate = GeoCheckpoint.objects.filter(activity=obj, order=1).exists()
            if not has_gate or ('address' in (form.changed_data or [])):
                need_geocode = True

        if not need_geocode:
            return

        addr = obj.address.strip()
        try:
            geo = geocode_address(addr)
        except Exception as e:
            self.message_user(request, f"定位服務錯誤：{e}", level=messages.ERROR)
            return

        if not geo:
            self.message_user(request, "無法定位此地址，請確認後手動於 Gate 填入座標。", level=messages.WARNING)
            return

        cp, created = GeoCheckpoint.objects.get_or_create(
            activity=obj, order=1,
            defaults={"title": "集合點", "lat": geo["lat"], "lng": geo["lng"], "radius_m": 80},
        )
        if not created:
            cp.lat = geo["lat"]; cp.lng = geo["lng"]
            if not cp.title:
                cp.title = "集合點"
            cp.save(update_fields=["lat", "lng", "title"])

        self.message_user(
            request,
            f"地址已定位：{geo.get('formatted_address') or addr}（{geo['lat']:.6f}, {geo['lng']:.6f}）",
            level=messages.SUCCESS
        )


# 以下保留你原本的註冊
@admin.register(Active_questions)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("question_text", "active", "sort_order", "options_id", "answer", "created_at")
    list_filter = ("active",)
    search_fields = ("question_text", "answer", "active__Activity_name")
    ordering = ("active", "sort_order")

@admin.register(Active_question_options)
class OptionAdmin(admin.ModelAdmin):
    list_display = ("options", "option_label", "option_value", "sort_order")
    list_filter = ("options",)
    search_fields = ("option_label", "option_value", "options__question_text")
    ordering = ("options", "sort_order")

@admin.register(GeoCheckpoint)
class GeoCheckpointAdmin(admin.ModelAdmin):
    list_display = ("activity", "order", "title", "lat", "lng", "radius_m")
    list_filter = ("activity",)
    search_fields = ("activity__Activity_name", "title")

@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ("user", "activity", "unlocked_stage", "last_checkin_at", "last_lat", "last_lng")
    list_filter = ("activity", "unlocked_stage")
    search_fields = ("user__username", "activity__Activity_name")



admin.site.site_header = "活動管理後台"
admin.site.site_title = "活動管理後台"
admin.site.index_title = "控制台"
