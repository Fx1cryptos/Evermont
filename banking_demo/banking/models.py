from decimal import Decimal

from django.conf import settings
from django.db import models
from django.db.models import Q


class AccountType(models.TextChoices):
    SAVINGS = "savings", "Savings"
    CURRENT = "current", "Current"


# Annual nominal percentage, minimum transaction, maximum transaction.
TERMS = {
    AccountType.SAVINGS: (Decimal("4.25"), Decimal("10.00"), Decimal("5000.00")),
    AccountType.CURRENT: (Decimal("0.50"), Decimal("1.00"), Decimal("10000.00")),
}
MAX_BALANCE = Decimal("999999999999.99")


class Account(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    kind = models.CharField(max_length=10, choices=AccountType.choices)
    balance = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    opened_at = models.DateTimeField(auto_now_add=True)
    interest_through = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["id"]
        constraints = [
            models.UniqueConstraint(fields=["owner", "kind"], name="one_account_per_type"),
            models.CheckConstraint(condition=Q(balance__gte=0), name="account_nonnegative"),
        ]

    @property
    def number(self):
        return f"{self.pk:08d}"

    @property
    def rate(self):
        return TERMS[self.kind][0]

    @property
    def minimum(self):
        return TERMS[self.kind][1]

    @property
    def maximum(self):
        return TERMS[self.kind][2]

    def __str__(self):
        return f"{self.get_kind_display()} · {self.number}"


class EntryKind(models.TextChoices):
    DEPOSIT = "deposit", "Deposit"
    WITHDRAWAL = "withdrawal", "Withdrawal"
    INTEREST = "interest", "Interest"


class Entry(models.Model):
    account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name="entries")
    kind = models.CharField(max_length=10, choices=EntryKind.choices)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    balance_after = models.DecimalField(max_digits=14, decimal_places=2)
    posted_at = models.DateTimeField(auto_now_add=True)
    interest_month = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["-posted_at", "-id"]
        indexes = [models.Index(fields=["account", "-posted_at", "-id"], name="entry_account_recent")]
        constraints = [
            models.CheckConstraint(condition=Q(amount__gt=0, balance_after__gte=0), name="entry_valid_amounts"),
            models.CheckConstraint(
                condition=Q(kind=EntryKind.INTEREST, interest_month__isnull=False)
                | (~Q(kind=EntryKind.INTEREST) & Q(interest_month__isnull=True)),
                name="entry_interest_month",
            ),
            models.UniqueConstraint(fields=["account", "interest_month"], name="one_interest_per_month"),
        ]

    @property
    def label(self):
        return {
            EntryKind.DEPOSIT: "Account deposit",
            EntryKind.WITHDRAWAL: "Account withdrawal",
            EntryKind.INTEREST: "Monthly interest",
        }[self.kind]

    def __str__(self):
        return f"{self.get_kind_display()} · {self.account}"
