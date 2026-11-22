from datetime import timedelta
from decimal import Decimal
from types import SimpleNamespace
from uuid import uuid4

from django.contrib.auth import get_user_model
from django.db import transaction

from .ledger import _post
from .models import Account, AccountType, Entry, EntryKind

SAMPLE_OWNERS = (
    (80014382, AccountType.SAVINGS, "18450.00"),
    (80016509, AccountType.CURRENT, "6090.80"),
)
SAMPLE_MOVES = (
    (0, AccountType.CURRENT, EntryKind.DEPOSIT, "2400.00"),
    (1, AccountType.CURRENT, EntryKind.WITHDRAWAL, "125.50"),
    (2, AccountType.SAVINGS, EntryKind.DEPOSIT, "750.00"),
    (4, AccountType.CURRENT, EntryKind.WITHDRAWAL, "84.20"),
    (5, AccountType.SAVINGS, EntryKind.DEPOSIT, "2000.00"),
    (6, AccountType.CURRENT, EntryKind.DEPOSIT, "700.50"),
    (7, AccountType.SAVINGS, EntryKind.DEPOSIT, "3750.00"),
    (8, AccountType.CURRENT, EntryKind.WITHDRAWAL, "990.50"),
    (9, AccountType.SAVINGS, EntryKind.DEPOSIT, "2200.00"),
)


def sample_entries(now):
    balances = {kind: Decimal(amount) for _, kind, amount in SAMPLE_OWNERS}
    for _, kind, movement, amount in SAMPLE_MOVES:
        balances[kind] -= Decimal(amount) * (-1 if movement == EntryKind.WITHDRAWAL else 1)
    entries = []
    for offset, kind, movement, raw_amount in reversed(SAMPLE_MOVES):
        amount = Decimal(raw_amount)
        balances[kind] += amount * (-1 if movement == EntryKind.WITHDRAWAL else 1)
        entries.append(SimpleNamespace(kind=movement, account_kind=kind, amount=amount,
                                       balance_after=balances[kind], posted_at=now - timedelta(days=offset)))
    return entries


def sample_snapshot(now):
    accounts = [Account(id=pk, kind=kind, balance=Decimal(amount)) for pk, kind, amount in SAMPLE_OWNERS]
    by_kind = {a.kind: a for a in accounts}
    entries = [
        Entry(account=by_kind[row.account_kind], amount=row.amount, kind=row.kind,
              balance_after=row.balance_after, posted_at=row.posted_at)
        for row in reversed(sample_entries(now))
    ]
    return accounts, entries


@transaction.atomic
def provision_demo(now):
    user = get_user_model().objects.create_user(username=f"workspace-{uuid4().hex}", first_name="Alex")
    rows = sample_entries(now)
    for _, kind, _ in SAMPLE_OWNERS:
        account = Account.objects.create(owner=user, kind=kind)
        movements = [row for row in rows if row.account_kind == kind]
        initial = movements[0].balance_after - movements[0].amount * (
            -1 if movements[0].kind == EntryKind.WITHDRAWAL else 1
        )
        opened = now - timedelta(days=10)
        Account.objects.filter(pk=account.pk).update(opened_at=opened)
        # Opening funding uses the same posting path and honors each account limit.
        while initial > 0:
            amount = min(initial, account.maximum)
            entry = _post(account, EntryKind.DEPOSIT, amount)
            Entry.objects.filter(pk=entry.pk).update(posted_at=opened)
            initial -= amount
        for row in movements:
            entry = _post(account, row.kind, row.amount)
            Entry.objects.filter(pk=entry.pk).update(posted_at=row.posted_at)
    return user
