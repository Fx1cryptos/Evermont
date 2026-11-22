const dialog = document.querySelector("#move-dialog");
if (dialog) {
  const form = dialog.querySelector("#movement-form");
  const account = dialog.querySelector("#movement-account");
  const kind = dialog.querySelector("#movement-kind");
  const heading = dialog.querySelector("#movement-heading");
  const details = dialog.querySelector("#movement-details");
  const submit = dialog.querySelector("#movement-submit");

  const refresh = () => {
    const option = account.selectedOptions[0];
    if (option.dataset[kind.value]) form.action = option.dataset[kind.value];
    details.textContent = `Available: ${option.dataset.balance} · Limits: ${option.dataset.limits}`;
  };

  const open = (movement) => {
    const label = movement === "deposit" ? "Deposit" : "Withdraw";
    heading.textContent = `${label} money`;
    submit.textContent = `Confirm ${movement}`;
    kind.value = movement;
    refresh();
    dialog.showModal();
  };

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => open(button.dataset.action));
  });
  account.addEventListener("change", refresh);
  dialog.querySelector("[data-close-dialog]").addEventListener("click", () => dialog.close());
  if (dialog.dataset.activeAction) {
    const index = Array.from(account.options).findIndex((option) => option.dataset.id === dialog.dataset.activeAccount);
    if (index >= 0) account.selectedIndex = index;
    open(dialog.dataset.activeAction);
  }
}
