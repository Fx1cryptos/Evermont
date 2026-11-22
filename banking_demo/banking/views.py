from datetime import timedelta
from decimal import Decimal

from uuid import uuid4

from django.contrib import messages
from django.contrib.auth import get_user_model, login
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ValidationError
from django.core.paginator import Paginator
from django.db import transaction
from django.http import Http404
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_POST, require_http_methods, require_safe

from .forms import AmountForm, OpenAccountForm, ReportForm
from .ledger import move_money, utc_start
from .models import Account, Entry, EntryKind
from .sample import provision_demo, sample_snapshot


def overview_data(request, now):
    if not request.user.is_authenticated:
        return sample_snapshot(now)
    accounts = list(Account.objects.filter(owner=request.user))
    entries = Entry.objects.filter(account__owner=request.user).select_related("account")
    return accounts, entries


def chart_data(accounts, entries, now):
    days = [now.date() - timedelta(days=offset) for offset in range(6, -1, -1)]
    values = []
    for day in days:
        end = utc_start(day + timedelta(days=1))
        if isinstance(entries, list):
            daily = [next((e.balance_after for e in entries
                           if e.account_id == a.pk and e.posted_at < end), a.balance) for a in accounts]
        else:
            daily = [next(iter(entries.filter(account=a, posted_at__lt=end)
                               .values_list("balance_after", flat=True)[:1]), Decimal(0)) for a in accounts]
        values.append(sum(daily))
    floor, ceiling = min(values), max(values)
    spread = ceiling - floor
    points = [(i * 100, int(83 - (value - floor) * 65 / spread) if spread else 48)
              for i, value in enumerate(values)]
    return {
        "line": " ".join(f"{x},{y}" for x, y in points),
        "area": "M0,104 L" + " L".join(f"{x},{y}" for x, y in points) + " L600,104 Z",
        "labels": days,
        "change": values[-1] - values[0],
    }


def show_dashboard(request, *, amount_form=None, active_account=None, action="", status=200):
    now = timezone.now()
    accounts, entries = overview_data(request, now)
    return render(request, "banking/dashboard.html", {
        "accounts": accounts,
        "entries": entries[:4],
        "total": sum(a.balance for a in accounts),
        "chart": chart_data(accounts, entries, now),
        "today": now,
        "amount_form": amount_form if amount_form is not None else AmountForm(),
        "active_account": active_account,
        "active_action": action,
    }, status=status)


@never_cache
@require_safe
def dashboard(request):
    return show_dashboard(request)


@never_cache
@require_http_methods(["GET", "HEAD", "POST"])
def accounts(request):
    open_form = OpenAccountForm(request.POST if request.method == "POST" else None)
    if request.method == "POST":
        if open_form.is_valid():
            with transaction.atomic():
                owner = request.user
                if not owner.is_authenticated:
                    owner = get_user_model().objects.create_user(username=f"workspace-{uuid4().hex}")
                _, created = Account.objects.get_or_create(owner=owner, kind=open_form.cleaned_data["kind"])
            if not request.user.is_authenticated:
                login(request, owner)
            if created:
                messages.success(request, "Your demo account is open.")
                return redirect("accounts")
            open_form.add_error("kind", "You already have an account of this type.")
    owned, _ = overview_data(request, timezone.now())
    return render(request, "banking/accounts.html", {"accounts": owned, "open_form": open_form})


@never_cache
@require_safe
def report(request):
    accounts, entries = overview_data(request, timezone.now())
    form = ReportForm(request.GET, accounts)
    if form.is_valid():
        account, start, end = (form.cleaned_data[k] for k in ("account", "start", "end"))
        if isinstance(entries, list):
            entries = [e for e in entries if (not account or str(e.account_id) == account)
                       and (not start or e.posted_at.date() >= start)
                       and (not end or e.posted_at.date() <= end)]
        else:
            if account:
                entries = entries.filter(account_id=account)
            if start:
                entries = entries.filter(posted_at__gte=utc_start(start))
            if end:
                entries = entries.filter(posted_at__lt=utc_start(end + timedelta(days=1)))
    else:
        entries = []
    page = Paginator(entries, 20).get_page(request.GET.get("page"))
    filters = request.GET.copy()
    filters.pop("page", None)
    return render(request, "banking/report.html", {"filters": form, "page": page, "query": filters.urlencode()})


@never_cache
@login_required
@require_POST
def move_funds(request, pk, kind):
    if kind not in (EntryKind.DEPOSIT, EntryKind.WITHDRAWAL):
        raise Http404
    account = get_object_or_404(Account, pk=pk, owner=request.user)
    form = AmountForm(request.POST)
    if form.is_valid():
        try:
            move_money(request.user, account.pk, kind, form.cleaned_data["amount"])
        except ValidationError as error:
            form.add_error("amount", error)
        else:
            messages.success(request, f"{EntryKind(kind).label} posted. Your balance is up to date.")
            return redirect("dashboard")
    return show_dashboard(request, amount_form=form, active_account=account.pk, action=kind, status=400)


@never_cache
@require_POST
def start_demo(request):
    if request.user.is_authenticated:
        return redirect("dashboard")
    now = timezone.now()
    kind = request.POST.get("kind", "")
    option = request.POST.get("account", "")
    active_account = None
    if kind:
        if kind not in (EntryKind.DEPOSIT, EntryKind.WITHDRAWAL):
            raise Http404
        accounts, _ = sample_snapshot(now)
        account = next((a for a in accounts if a.kind == option), None)
        if account is None:
            raise Http404
        active_account = account.pk
        form = AmountForm(request.POST)
        if not form.is_valid():
            return show_dashboard(request, amount_form=form, active_account=active_account, action=kind, status=400)
    try:
        with transaction.atomic():
            user = provision_demo(now)
            if kind:
                account = Account.objects.get(owner=user, kind=option)
                move_money(user, account.pk, kind, form.cleaned_data["amount"])
    except ValidationError as error:
        if not kind:
            raise
        form.add_error("amount", error)
        return show_dashboard(request, amount_form=form, active_account=active_account, action=kind, status=400)
    login(request, user)
    messages.success(request, "Your sample workspace is ready." if not kind
                     else f"{EntryKind(kind).label} posted in your sample workspace.")
    return redirect("dashboard")
