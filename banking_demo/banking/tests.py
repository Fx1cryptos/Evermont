from datetime import datetime, timezone as dt_timezone
from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import Client, TestCase
from django.urls import reverse

from .ledger import move_money
from .models import Account, AccountType, Entry, EntryKind
from .tasks import post_monthly_interest

User = get_user_model()


def at(year, month, day, hour=0, minute=0):
    return datetime(year, month, day, hour, minute, tzinfo=dt_timezone.utc)


class BankingFlowTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="jordan")
        self.account = Account.objects.create(owner=self.user, kind=AccountType.SAVINGS)
        self.client.force_login(self.user)

    def post_funds(self, kind, amount, account=None):
        return self.client.post(reverse("move_funds", args=[(account or self.account).pk, kind]), {"amount": amount})

    def test_balance_and_history_are_updated_atomically(self):
        self.assertRedirects(self.post_funds("deposit", "100.55"), "/")
        self.assertRedirects(self.post_funds("withdrawal", "25.20"), "/")
        self.account.refresh_from_db()
        self.assertEqual(self.account.balance, Decimal("75.35"))
        self.assertEqual(list(self.account.entries.values_list("balance_after", flat=True)),
                         [Decimal("75.35"), Decimal("100.55")])
        self.assertContains(self.client.get(reverse("report")), "Running balance")
        self.assertContains(self.client.get(reverse("dashboard")), "$75.35")

    def test_invalid_amounts_and_overdraft_leave_the_ledger_unchanged(self):
        for kind, amount in [("deposit", "9.99"), ("deposit", "5000.01"), ("deposit", "-50"),
                             ("deposit", "10.001"), ("withdrawal", "10.00")]:
            with self.subTest(kind=kind, amount=amount):
                self.assertEqual(self.post_funds(kind, amount).status_code, 400)
        self.account.refresh_from_db()
        self.assertEqual(self.account.balance, Decimal("0.00"))
        self.assertFalse(self.account.entries.exists())
        with self.assertRaises(ValidationError):
            move_money(self.user, self.account.pk, EntryKind.DEPOSIT, Decimal("NaN"))

    def test_report_filters_keep_original_running_balances(self):
        for date, amount in [(at(2026, 1, 1, 23, 59), "10.00"), (at(2026, 1, 2, 23, 59), "30.00"),
                             (at(2026, 1, 3), "20.00")]:
            with patch("django.utils.timezone.now", return_value=date):
                self.post_funds("deposit", amount)
        filtered = self.client.get(reverse("report"), {"start": "2026-01-02", "end": "2026-01-02"})
        self.assertEqual([(row.amount, row.balance_after) for row in filtered.context["page"].object_list],
                         [(Decimal("30.00"), Decimal("40.00"))])
        invalid = self.client.get(reverse("report"), {"start": "2026-01-03", "end": "2026-01-02"})
        self.assertContains(invalid, "The start date must come before or match the end date.")

    def test_member_cannot_read_or_change_another_members_account(self):
        other_user = User.objects.create_user(username="other-member")
        other = Account.objects.create(owner=other_user, kind=AccountType.CURRENT)
        move_money(other_user, other.pk, EntryKind.DEPOSIT, Decimal("123.45"))
        self.assertEqual(self.post_funds("withdrawal", "2.00", other).status_code, 404)
        self.assertNotContains(self.client.get(reverse("dashboard")), "$123.45")
        self.assertEqual(self.client.get(reverse("report"), {"account": other.pk}).context["page"].paginator.count, 0)
        self.assertRedirects(self.client.get(reverse("admin:index")), "/admin/login/?next=/admin/",
                             fetch_redirect_response=False)

    def test_passwordless_workspace_opens_selected_type_and_prevents_duplicates(self):
        self.client.logout()
        self.assertEqual(self.client.get("/register/").status_code, 404)
        self.assertEqual(self.client.post("/login/").status_code, 404)
        self.assertRedirects(self.client.post(reverse("accounts"), {"kind": "current"}), "/accounts/")
        owner = User.objects.get(pk=self.client.session["_auth_user_id"])
        self.assertFalse(owner.has_usable_password())
        accounts = Account.objects.filter(owner=owner)
        self.assertEqual(accounts.get().kind, AccountType.CURRENT)
        self.assertRedirects(self.client.post(reverse("accounts"), {"kind": "savings"}), "/accounts/")
        self.assertContains(self.client.post(reverse("accounts"), {"kind": "savings"}), "already have an account")
        self.assertEqual(accounts.count(), 2)

    def test_sample_workspace_is_private_and_starts_with_an_explicit_post(self):
        visitor = Client(enforce_csrf_checks=True)
        dashboard = visitor.get("/")
        self.assertContains(dashboard, "$24,540.80")
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(visitor.post(reverse("start_demo")).status_code, 403)
        result = visitor.post(reverse("start_demo"), {
            "kind": "deposit", "account": "current", "amount": "12.00",
            "csrfmiddlewaretoken": visitor.cookies["evermont_demo_csrf"].value,
        })
        self.assertRedirects(result, "/")
        self.assertContains(visitor.get("/"), "$24,552.80")
        self.assertContains(Client().get("/"), "$24,540.80")
        self.assertNotContains(self.client.get("/"), "$24,552.80")


class MonthlyInterestTests(TestCase):
    def test_job_uses_month_end_balance_and_posts_once_at_each_type_rate(self):
        user = User.objects.create_user(username="interest-member")
        with patch("django.utils.timezone.now", return_value=at(2026, 1, 1)):
            savings = Account.objects.create(owner=user, kind=AccountType.SAVINGS)
            current = Account.objects.create(owner=user, kind=AccountType.CURRENT)
            empty = Account.objects.create(owner=User.objects.create_user(username="empty"), kind=AccountType.CURRENT)
            for account in [savings, current]:
                move_money(user, account.pk, EntryKind.DEPOSIT, Decimal("1200.00"))
        with patch("django.utils.timezone.now", return_value=at(2026, 2, 3)):
            move_money(user, savings.pk, EntryKind.DEPOSIT, Decimal("800.00"))
            self.assertEqual(post_monthly_interest(), 2)
            self.assertEqual(post_monthly_interest(), 0)
        credits = Entry.objects.filter(kind=EntryKind.INTEREST)
        self.assertEqual(credits.get(account=savings).amount, Decimal("4.25"))
        self.assertEqual(credits.get(account=current).amount, Decimal("0.50"))
        self.assertEqual(credits.get(account=savings).balance_after, Decimal("2004.25"))
        self.assertEqual(credits.get(account=savings).interest_month.isoformat(), "2026-01-01")
        empty.refresh_from_db()
        self.assertEqual(empty.interest_through.isoformat(), "2026-01-01")
        self.assertFalse(credits.filter(account=empty).exists())

    def test_job_catches_up_multiple_months_without_backdating_ledger_rows(self):
        user = User.objects.create_user(username="catchup-member")
        with patch("django.utils.timezone.now", return_value=at(2026, 1, 1)):
            account = Account.objects.create(owner=user, kind=AccountType.SAVINGS)
            move_money(user, account.pk, EntryKind.DEPOSIT, Decimal("1200"))
        with patch("django.utils.timezone.now", return_value=at(2026, 4, 2)):
            self.assertEqual(post_monthly_interest(), 3)
            self.assertEqual(post_monthly_interest(), 0)
        credits = account.entries.filter(kind=EntryKind.INTEREST).order_by("interest_month")
        self.assertEqual([row.interest_month.month for row in credits], [1, 2, 3])
        self.assertTrue(all(row.posted_at == at(2026, 4, 2) for row in credits))
        account.refresh_from_db()
        self.assertEqual(account.balance, Decimal("1212.75"))
