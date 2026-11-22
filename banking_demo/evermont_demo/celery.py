import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "evermont_demo.settings")

app = Celery("evermont_demo")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
