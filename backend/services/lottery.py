# services/lottery.py
import random
from django.db import transaction
from django.utils import timezone
from events.models import Activity_Form
from lottery.models import LotteryEntry  # 依你的 app 名稱調整

def draw_winners_for_activity(activity: Activity_Form):
    # Idempotent：已抽過就直接返回
    if activity.lottery_drawn:
        return []

    with transaction.atomic():
        # 鎖住這筆活動，避免並發重複抽
        act = (Activity_Form.objects.select_for_update()
               .get(pk=activity.pk))

        if act.lottery_drawn:
            return []

        # 依你的規則篩出「有資格」參與抽獎的名單：
        # 例：已完成所有指定地點表單 + 沒被取消資格
        eligible_qs = (LotteryEntry.objects
            .select_for_update(skip_locked=True)
            .filter(activity=act, is_winning=False)
            # 如果還有例如 completed=True、location_verified=True 就加在這裡
        )

        ids = list(eligible_qs.values_list('id', flat=True))
        if not ids:
            act.lottery_drawn = True
            act.lottery_done_at = timezone.now()
            act.save(update_fields=['lottery_drawn','lottery_done_at'])
            return []

        k = min(act.lottery_quota, len(ids))
        winner_ids = set(random.sample(ids, k))

        # 標記中獎者（一次性批次更新）
        (LotteryEntry.objects
         .filter(id__in=winner_ids)
         .update(is_winning=True))

        # 活動標記為已抽過
        act.lottery_drawn = True
        act.lottery_done_at = timezone.now()
        act.save(update_fields=['lottery_drawn','lottery_done_at'])

        # 回傳中獎 entry（可再取 user 資料給前端顯示）
        return list(LotteryEntry.objects.filter(id__in=winner_ids))
