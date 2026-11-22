from datetime import datetime, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP

from django.core.exceptions import ValidationError
from django.db import transaction

from .models import MAX_BALANCE, Account, Entry, EntryKind

CENT = Decimal("0.01")
ZERO = Decimal("0.00")


def utc_start(day):
    return datetime.combine(day, datetime.min.time(), tzinfo=timezone.utc)


def next_month(day):
    return (day.replace(day=28) + timedelta(days=4)).replace(day=1)


def _post(account, kind, amount, interest_month=None):
    balance = account.balance + (-amount if kind == EntryKind.WITHDRAWAL else amount)
    if not ZERO <= balance <= MAX_BALANCE:
        raise ValidationError("Insufficient funds." if balance < ZERO else "The account balance limit was reached.")
    entry = Entry.objects.create(
        account=account, kind=kind, amount=amount, balance_after=balance, interest_month=interest_month,
    )
    account.balance = balance
    account.save(update_fields=["balance"])
    return entry


@transaction.atomic
def move_money(owner, account_id, kind, amount):
    account = Account.objects.select_for_update().get(pk=account_id, owner=owner)
    if kind not in (EntryKind.DEPOSIT, EntryKind.WITHDRAWAL):
        raise ValidationError("Choose a deposit or a withdrawal.")
    if (not amount.is_finite() or not account.minimum <= amount <= account.maximum
            or amount != amount.quantize(CENT)):
        raise ValidationError(f"Enter an amount between ${account.minimum:,.2f} and ${account.maximum:,.2f}.")
    return _post(account, kind, amount)


@transaction.atomic
def reconcile_interest(account_id, today):
    account = Account.objects.select_for_update().get(pk=account_id)
    opened_month = account.opened_at.date().replace(day=1)
    month = next_month(account.interest_through) if account.interest_through else opened_month
    current_month = today.replace(day=1)
    count = 0
    while month < current_month:
        following = next_month(month)
        # Use the recorded closing balance even if the scheduler runs days later.
        closing_balance = (
            account.entries.filter(posted_at__lt=utc_start(following))
            .values_list("balance_after", flat=True).first()
        ) or ZERO
        credit = (closing_balance * account.rate / Decimal(1200)).quantize(CENT, rounding=ROUND_HALF_UP)
        if credit > ZERO:
            _post(account, EntryKind.INTEREST, credit, interest_month=month)
            count += 1
        account.interest_through = month
        month = following
    if account.interest_through:
        account.save(update_fields=["interest_through"])
    return count
