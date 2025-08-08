from django.db import models

# Create your models here.
#活動表單建立
class Activity_Form(models.Model):
    Activity_name=models.CharField(max_length=128)
    Activity_start_date=models.DateTimeField()
    Activity_end_date=models.DateTimeField()
    descripe=models.CharField(max_length=1024)
    def __str__(self):
        return self.Activity_name
#活動表單裡面的題目建立
class Active_questions(models.Model):
    active_id=models.IntegerField()
    question_text=models.CharField(max_length=1024)
    options_id=models.IntegerField()
    sort_order=models.IntegerField()
    answer=models.CharField(max_length=128)
    created_at=models.DateTimeField(auto_now_add=True)
    update_at=models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.question_text
#表單題目的4個選項建立
class Active_question_options(models.Model):
     option_id=models.IntegerField()
     option_label=models.CharField(max_length=64) #// 顯示的選項文字 
     option_value=models.CharField(max_length=1024) # 顯示的選項實際值 
     sort_order=models.IntegerField() #顯示選項的順序
     def __str__(self):
        return self.option_id



