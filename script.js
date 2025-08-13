// ==== Telegram Mini App ====
const tg = Telegram.WebApp;
tg.ready();
tg.expand();

// Статус інвойсу
function onInvoiceStatus(status, sku) {
  const el = document.getElementById("buy-status");
  if (!el) return;
  if (status === "paid")       el.innerText = "Оплата успішна ✅ Нагорода нарахована!";
  else if (status === "failed")   el.innerText = "Помилка платежу. Спробуй ще.";
  else if (status === "cancelled")el.innerText = "Платіж скасовано.";
  else                           el.innerText = "Очікуємо підтвердження…";
}

// Відкрити оплату Stars
function openStarsInvoice({ sku, amount }) {
  const title =
    "TON Vault — " +
    (sku === "chest_small" ? "Мала скриня" :
     sku === "chest_medium" ? "Середня скриня" : "Велика скриня");

  const description = "Внутрішній товар у Mini App TON Vault";
  const payload = `vault_${sku}_${Date.now()}`;

  // Діагностичний алерт (можна прибрати після тесту)
  // tg.showAlert(`Клік: ${title} на ${amount} ⭐`);

  tg.openInvoice(
    {
      title,
      description,
      payload,
      provider_token: "STARS",      // обов'язково для Telegram Stars у WebApp
      currency: "STARS",            // валюта Stars у WebApp
      prices: [{ label: title, amount }], // amount = кількість зірок (1000 = 1000⭐)
      photo_url: location.origin + location.pathname + "icon_v2.png"
    },
    (status) => onInvoiceStatus(status, sku)
  );
}

// Прив’язка кліків
document.querySelectorAll("button.buy").forEach((btn) => {
  btn.addEventListener("click", () => {
    const sku = btn.dataset.sku;
    const amount = parseInt(btn.dataset.amount, 10);
    const el = document.getElementById("buy-status");
    if (el) el.innerText = "Відкриваю оплату…";
    openStarsInvoice({ sku, amount });
  });
});
