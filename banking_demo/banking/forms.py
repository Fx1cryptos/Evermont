from datetime import date

from django import forms
from django.contrib.auth.forms import UserCreationForm

from .models import AccountType


class RegistrationForm(UserCreationForm):
    first_name = forms.CharField(label="First name", max_length=150)
    kind = forms.ChoiceField(label="Account type", choices=AccountType.choices)

    class Meta(UserCreationForm.Meta):
        fields = ("first_name", "username", "kind")


class OpenAccountForm(forms.Form):
    kind = forms.ChoiceField(label="Account type", choices=AccountType.choices)


class AmountForm(forms.Form):
    amount = forms.DecimalField(
        max_digits=7, decimal_places=2,
        widget=forms.NumberInput(attrs={"inputmode": "decimal", "min": "0.01",
                                         "step": "0.01", "placeholder": "0.00"}),
    )


class ReportForm(forms.Form):
    account = forms.ChoiceField(required=False)
    start = forms.DateField(required=False, widget=forms.DateInput(format="%Y-%m-%d", attrs={"type": "date"}))
    end = forms.DateField(required=False, widget=forms.DateInput(format="%Y-%m-%d", attrs={"type": "date"}))

    def __init__(self, data, accounts):
        super().__init__(data)
        self.fields["account"].choices = [("", "All accounts")] + [(str(a.pk), str(a)) for a in accounts]

    def clean(self):
        data = super().clean()
        start, end = data.get("start"), data.get("end")
        if end == date.max:
            self.add_error("end", "Choose an earlier end date.")
        elif start and end and start > end:
            raise forms.ValidationError("The start date must come before or match the end date.")
        return data
