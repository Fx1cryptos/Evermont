from django.contrib import admin

from .models import Account, Entry

admin.site.site_header = "Evermont demo administration"


class LedgerAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Account)
class AccountAdmin(LedgerAdmin):
    list_display = ("id", "owner", "kind", "balance", "opened_at", "interest_through")
    list_filter = ("kind",)
    search_fields = ("owner__username",)


@admin.register(Entry)
class EntryAdmin(LedgerAdmin):
    list_display = ("id", "account", "kind", "amount", "balance_after", "posted_at", "interest_month")
    list_filter = ("kind",)
    search_fields = ("account__owner__username",)
