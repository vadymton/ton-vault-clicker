// ===== Telegram Mini App init =====
const tg = window.Telegram.WebApp;
tg.expand();

const user = tg?.initDataUnsafe?.user;
const hello = document.getElementById("hello");
if (hello) hello.innerText = `Привіт, ${user?.first_name || "користувач"}!`;

// ===== TonConnect (опційно) =====
try {
  if (window.TON_CONNECT_UI) {
    const base = window.location.href.replace(/[^/]*$/, "");
    const manifestUrl = base + "tonconnect-manifest.json";
    const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({ manifestUrl });

    const btn = document.getElementById("connect-button");
    const out = document.getElementById("wallet");
    if (btn) {
      btn.onclick = async () => {
        try {
          await tonConnectUI.connectWallet();
          const w = tonConnectUI.wallet;
          if (w && w.account) out.innerText = "Адреса: " + w.account.address;
        } catch {
          if (out) out.innerText = "Скасовано або помилка підключення";
        }
      };
    }
  }
} catch (e) {
  console.warn("TonConnect init skipped:", e);
}

// Кнопка "Закрити"
const closeBtn = document.getElementById("close-button");
if (closeBtn) closeBtn.onclick = () => tg.close();

// ===== Оплата через Telegram Stars =====
function onInvoiceStatus(status, sku) {
  const el = document.getElementById("buy-status");
  if (!el) return;
  if (status === "paid")       el.innerText = "Оплата успішна ✅ Нагорода нарахована!";
  else if (status === "failed")   el.innerText = "Помилка платежу. Спробуй ще раз.";
  else if (status === "cancelled")el.innerText = "Платіж скасовано.";
  else                           el.innerText = "Очікуємо підтвердження…";
}

function openStarsInvoice({ sku, amount }) {
  const title =
    "TON Vault — " +
    (sku === "chest_small" ? "Мала скриня"
     : sku === "chest_medium" ? "Середня скриня"
     : "Велика скриня");

  const description = "Внутрішній товар у Mini App TON Vault";
  const payload = `vault_${sku}_${Date.now()}`;

  Telegram.WebApp.openInvoice(
    {
      title,
      description,
      payload,
      provider_token: "STARS",       // обов'язково для Stars
      currency: "STARS",
      prices: [{ label: title, amount }], // amount = кількість зірок
      photo_url: location.origin + location.pathname + "icon_v2.png",
      need_name: false,
      need_email: false
    },
    (status) => onInvoiceStatus(status, sku)
  );
}

// Прив'язка кнопок
document.querySelectorAll("button.buy").forEach((btn) => {
  btn.addEventListener("click", () => {
    const sku = btn.dataset.sku;
    const amount = parseInt(btn.dataset.amount, 10);
    const el = document.getElementById("buy-status");
    if (el) el.innerText = "Відкриваю оплату…";
    openStarsInvoice({ sku, amount });
  });
});
