// === Оплати через Telegram Stars (без сервера) ===
function onInvoiceStatus(status, sku) {
  const el = document.getElementById("buy-status");
  if (status === "paid") {
    el.innerText = "Оплата успішна ✅ Нагорода нарахована!";
  } else if (status === "failed") {
    el.innerText = "Помилка платежу. Спробуй ще раз.";
  } else if (status === "cancelled") {
    el.innerText = "Платіж скасовано.";
  } else {
    el.innerText = "Очікуємо підтвердження…";
  }
}

async function openStarsInvoice({ sku, amount }) {
  const title =
    "TON Vault — " +
    (sku === "chest_small"
      ? "Мала скриня"
      : sku === "chest_medium"
      ? "Середня скриня"
      : "Велика скриня");

  const description = "Внутрішній товар у Mini App TON Vault";
  const payload = `vault_${sku}_${Date.now()}`;

  Telegram.WebApp.openInvoice(
    {
      title,
      description,
      payload,
      provider_token: "STARS",     // обов'язково так для Telegram Stars
      currency: "STARS",           // валюта теж STARS
      prices: [{ label: title, amount }], // amount = кількість зірок
      photo_url: location.origin + location.pathname + "icon_v2.png"
    },
    (status) => onInvoiceStatus(status, sku)
  );
}

// Прив’язуємо обробники до кнопок
document.querySelectorAll("button.buy").forEach((btn) => {
  btn.addEventListener("click", () => {
    const sku = btn.dataset.sku;
    const amount = parseInt(btn.dataset.amount, 10);
    const el = document.getElementById("buy-status");
    if (el) el.innerText = "Відкриваю оплату…";
    openStarsInvoice({ sku, amount });
  });
});
