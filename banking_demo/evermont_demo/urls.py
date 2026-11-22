from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.urls import path

from banking import views

urlpatterns = [
    path("", views.dashboard, name="dashboard"),
    path("accounts/", views.accounts, name="accounts"),
    path("transactions/", views.report, name="report"),
    path("accounts/<int:pk>/transaction/<str:kind>/", views.move_funds, name="move_funds"),
    path("demo/start/", views.start_demo, name="start_demo"),
    path("logout/", auth_views.LogoutView.as_view(), name="logout"),
    path("admin/", admin.site.urls),
]
