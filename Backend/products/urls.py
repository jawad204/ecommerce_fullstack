from django.urls import path
from .views import CategoryListView, ProductListCreateView, ProductDetailView


urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('', ProductListCreateView.as_view(), name='product-list-create'),
    path('<slug:slug>/', ProductDetailView.as_view(), name='product-detail'),
]