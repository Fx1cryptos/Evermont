import logging
from datetime import timedelta

from celery import shared_task
from django.core.exceptions import ValidationError
from django.db import OperationalError
from django.db.models import Q
from django.utils import timezone

from .ledger import reconcile_interest, utc_start
from .models import Account

logger = logging.getLogger(__name__)


@shared_task(autoretry_for=(OperationalError,), retry_backoff=True, acks_late=True)
def post_monthly_interest():
    today = timezone.localdate()
    start = today.replace(day=1)
    previous = (start - timedelta(days=1)).replace(day=1)
    accounts = Account.objects.filter(opened_at__lt=utc_start(start)).filter(
        Q(interest_through__isnull=True) | Q(interest_through__lt=previous)
    )
    posted = 0
    last_id = 0
    while account_ids := list(accounts.filter(pk__gt=last_id).values_list("pk", flat=True)[:100]):
        for account_id in account_ids:
            try:
                posted += reconcile_interest(account_id, today)
            except Account.DoesNotExist:
                continue
            except ValidationError:
                logger.exception("Could not post monthly demo interest for account %s", account_id)
        last_id = account_ids[-1]
    return posted
