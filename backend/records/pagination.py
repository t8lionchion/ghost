# accounts/pagination.py
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10                # 預設每頁 10 筆
    page_size_query_param = "page_size" # URL 參數可改 page_size
    max_page_size = 100                 # 上限
