// Telegram Mini App
const tg = window.Telegram.WebApp;
tg.expand();

const user = tg?.initDataUnsafe?.user;
document.getElementById("hello").innerText =
  `Привіт, ${user?.first_name || "користувач"}!`;

// Маніфест відносно поточного шляху (працює на GitHub Pages)
const base = window.location.href.replace(/[^/]*$/, '');
const manifestUrl = base + 'tonconnect-manifest.json';

// TON Connect UI
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({ manifestUrl });

document.getElementById("connect-button").onclick = async () => {
  try {
    await tonConnectUI.connectWallet();
    const w = tonConnectUI.wallet;
    if (w && w.account) {
      document.getElementById("wallet").innerText = "Адреса: " + w.account.address;
    }
  } catch (e) {
    document.getElementById("wallet").innerText = "Скасовано або помилка підключення";
  }
};

document.getElementById("close-button").onclick = () => // === Оплати через Telegram Stars ===
// Хелпер для відкриття інвойсу Stars
async function openStarsInvoice({ sku, amount }) {
  const title = "TON Vault — " + (
    sku === "chest_small"  ? "Мала скриня" :
    sku === "chest_medium" ? "Середня скриня" :
    "Велика скриня"
  );
  const description = "Внутрішній товар у Mini App TON Vault";
  const payload = `vault_${sku}_${Date.now()}`;

  // Відкриваємо платіж у Mini App
  Telegram.WebApp.openInvoice({
    title,
    description,
    payload,
    provider_token: "STARS",   // Спеціальний токен для зірок
    currency: "STARS",         // Оплата саме в Stars
    prices: [{ label: title, amount: amount }], // сума в зірках
    photo_url: location.origin + location.pathname + "icon_v2.png",
    need_name: false,
    need_email: false
  }, function onPaid(status) {
    // status: "paid", "cancelled", "failed", "pending"
    const el = document.getElementById("buy-status");
    if (status === "paid") {
      el.innerText = "Оплата успішна ✅ Нараховано нагороду!";
      // TODO: тут додай свою логіку: +монети/бонуси гравцю
    } else if (status === "cancelled") {
      el.innerText = "Платіж скасовано.";
    } else if (status === "failed") {
      el.innerText = "Помилка платежу. Спробуй ще раз.";
    } else {
      el.innerText = "Очікуємо підтвердження…";
    }
  });
}

// Вішаємо обробники на кнопки “Купити”
document.querySelectorAll("button.buy").forEach(btn => {
  btn.addEventListener("click", () => {
    const sku = btn.dataset.sku;
    const amount = parseInt(btn.dataset.amount, 10);
    document.getElementById("buy-status").innerText = "Відкриваю оплату…";
    openStarsInvoice({ sku, amount });
  });
});
