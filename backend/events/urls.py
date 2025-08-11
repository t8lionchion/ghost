from django.urls import path
from .views import GetActivity_fromView
from .views import GetAllActivityView
from .views import GetActivityWithQuestionsView


    
urlpatterns = [
    path('GetActivity_form/<int:id>/', GetActivity_fromView.as_view(), name='GetActivity_from'),
    path('GetAllActivityView/',GetAllActivityView.as_view(),name='GetAllActivityView'),
    path('activities/<int:id>/questions/', GetActivityWithQuestionsView.as_view()),

]