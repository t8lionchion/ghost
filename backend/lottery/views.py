from django.shortcuts import render
from accounts.auth import MyJWTAuthentication
from rest_framework.decorators import permission_classes,authentication_classes
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from accounts.auth import MyJWTAuthentication
from rest_framework.response import Response
from rest_framework import status
from events.models import Activity_Form, Active_questions
from lottery.models import LotteryEntry
from lottery.serializers import SubmitAnswersSerializer
from django.utils import timezone
from django.db import transaction
from django.db.models import F

# Create your views here.

class SubmitActivityAnswersView(APIView):
    authentication_classes = [MyJWTAuthentication]   # ★ 一定要掛
    permission_classes = [IsAuthenticated]           # ★ 一定要掛

    def post(self, request, active_id):
        # 1) 解析 body
        s = SubmitAnswersSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        user = request.user
        pairs = s.validated_data['pairs']

        # 2) 確認活動存在
        try:
            activity = Activity_Form.objects.get(pk=active_id)
        except Activity_Form.DoesNotExist:
            return Response({"message": "活動不存在"}, status=status.HTTP_404_NOT_FOUND)

        # 3) 活動時間檢查（注意用 timezone.now()）
        now = timezone.now()
        print(now)
        if not (activity.Activity_start_date <= now <= activity.Activity_end_date):
            return Response({"message": "不在活動時間內"}, status=status.HTTP_400_BAD_REQUEST)

        # 4) 取題目與正解
        qs = Active_questions.objects.filter(active=activity).values('id', 'answer')
        total = qs.count()
        if total == 0:
            return Response({"message": "此活動尚無題目"}, status=status.HTTP_400_BAD_REQUEST)

        # 5) 計分
        correct = 0
        for row in qs:
            qid = row['id']
            correct_ans = (row['answer'] or '').strip()
            user_ans = (pairs.get(qid) or '').strip()
            if user_ans == correct_ans:
                correct += 1

        passed = (correct * 2 > total)  # 必須「超過一半」
        if not passed:
            return Response({
                "passed": False,
                "correct_count": correct,
                "total": total,
                "message": "答對未達一半，無法取得抽獎次數。"
            }, status=status.HTTP_200_OK)

        # 5) 交易 + 原子遞增
        with transaction.atomic():
            stat, created = LotteryEntry.objects.select_for_update().get_or_create(
                user=user, activity=activity, defaults={"times": 0}
            )
            LotteryEntry.objects.filter(pk=stat.pk).update(times=F('times') + 1)
            stat.refresh_from_db()

        return Response({
            "passed": True,
            "correct_count": correct,
            "total": total,
            "times": stat.times
        }, status=status.HTTP_200_OK)

class GetNumberOfDrawsView(APIView):
    authentication_classes = [MyJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, activity_id, format=None):
        user_id = request.user.id                     # 用 token 內的登入者
        times = LotteryEntry.objects.filter(
            user_id=user_id, activity_id=activity_id
        ).count()
        prize_list = list(LotteryEntry.objects.values('id','prize', 'is_winning','user_id'))  # ← 變成 list[dict]
        return Response({"times": times,"prize":prize_list}, status=200)