# events/management/commands/run_lottery.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from events.models import Activity_Form
from services.lottery import draw_winners_for_activity

class Command(BaseCommand):
    help = "Scan ended activities and draw winners automatically."

    def handle(self, *args, **options):
        now = timezone.now()
        qs = Activity_Form.objects.filter(
            isActive=True,
            lottery_drawn=False,
            Activity_end_date__lte=now,
        ).only('id','lottery_quota')
        for act in qs:
            winners = draw_winners_for_activity(act)
            self.stdout.write(self.style.SUCCESS(
                f"[{act.id}] Drawn {len(winners)} winners."
            ))
