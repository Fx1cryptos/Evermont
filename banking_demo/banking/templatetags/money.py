from django import template

register = template.Library()


@register.filter
def usd(value):
    return f"${value:,.2f}"


@register.filter
def signed_usd(value):
    return f"{'+' if value >= 0 else '−'}${abs(value):,.2f}"
