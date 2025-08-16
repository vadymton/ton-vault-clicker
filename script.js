// ===== TON Vault Clicker — WebApp Front =====

// 1) Базова ініціалізація Telegram WebApp
const API_URL = "https://ton-vault-backend.onrender.com";
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Привітання
const user = tg.initDataUnsafe?.user;
const u = document.getElementById("user");
if (u) u.textContent = user ? `Привіт, ${user.first_name}!` : "Привіт!";

// 2) Хелпер для статусу покупки
function setStatus(text) {
  const el = document.getElementById("buy-status");
  if (el) el.textContent = text;
}

// 3) Покупка через Telegram Stars
async function buyStars(sku, amountXTR) {
  try {
    setStatus("Готуємо інвойс…");

    const resp = await fetch(`${API_URL}/api/create-stars-invoice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        initData: tg.initData || tg.initDataUnsafe, // важливо передавати initData
        sku,
        amount: amountXTR // сума в XTR (ціле число)
      })
    });

    const data = await resp.json();
    if (!resp.ok || !data.invoice_link) {
      throw new Error(data.error || "Немає invoice_link");
    }

    tg.openInvoice(data.invoice_link, (status) => {
      if (status === "paid") setStatus("✅ Оплачено!");
      else if (status === "failed") setStatus("❌ Помилка оплати");
      else if (status === "cancelled") setStatus("❌ Платіж скасовано");
      else setStatus("⏳ Очікуємо підтвердження…");
    });
  } catch (e) {
    setStatus("❌ " + (e.message || "Помилка"));
    console.error(e);
  }
}

// 4) Прив’язка до кнопок з класом .buy
// Приклад HTML: <button class="buy" data-sku="chest_small" data-amount="100">Купити S</button>
document.querySelectorAll(".buy").forEach((btn) => {
  btn.addEventListener("click", () => {
    const sku = btn.dataset.sku; // напр. "chest_small"
    const amount = parseInt(btn.dataset.amount, 10); // напр. 100
    if (!sku || !amount) return setStatus("❌ Невірні дані товару");
    buyStars(sku, amount);
  });
});

// 5) Швидкий пінг бекенду у консоль (для дебагу)
(async () => {
  try {
    const r = await fetch(`${API_URL}/ping`);
    console.log("Ping:", await r.text()); // очікуємо "pong"
  } catch (e) {
    console.error("Backend ping error", e);
  }
})();
