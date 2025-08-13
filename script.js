const tg = Telegram.WebApp;
tg.ready();
tg.expand();

function onInvoiceStatus(status) {
  const el = document.getElementById("buy-status");
  if (!el) return;
  if (status === "paid")       el.innerText = "✅ Оплата успішна!";
  else if (status === "cancelled") el.innerText = "❌ Платіж скасовано";
  else if (status === "failed")    el.innerText = "❌ Помилка платежу";
  else                             el.innerText = "⏳ Очікуємо підтвердження…";
}

document.querySelectorAll(".buy").forEach(btn => {
  btn.addEventListener("click", () => {
    const sku = btn.dataset.sku;
    const amount = parseInt(btn.dataset.amount, 10);

    tg.openInvoice({
      title: `TON Vault — ${btn.innerText.replace(/ — .+/, "")}`,
      description: "Внутрішній товар у Mini App TON Vault",
      payload: `vault_${sku}_${Date.now()}`,
      provider_token: "STARS",   // токен для Stars
      currency: "XTR",           // валюта Stars
      prices: [{ label: btn.innerText, amount }], // кількість зірок
      photo_url: location.origin + location.pathname + "icon_v2.png"
    }, onInvoiceStatus);
  });
});
