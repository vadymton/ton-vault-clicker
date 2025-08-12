// Telegram WebApp (у браузері не заважає)
const tg = window.Telegram?.WebApp;
tg?.ready?.();
tg?.expand?.();

// === TonConnect UI ===
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
  manifestUrl: "https://vadymton.github.io/ton-vault-clicker/tonconnect-manifest.json?v=17",
  buttonRootId: "tc-root"
});

// Показуємо статус підключення
const addrEl = document.getElementById('addr');
const disconnectBtn = document.getElementById('disconnect'); // якщо є кнопка

function renderStatus(wallet) {
  const addr = wallet?.account?.address;
  addrEl && (addrEl.textContent = addr ? `Підключено: ${addr}` : 'Гаманець не підключено');
  if (disconnectBtn) disconnectBtn.style.display = addr ? '' : 'none';
}

tonConnectUI.onStatusChange(renderStatus);

// (опц.) кнопка «Від’єднати»
if (disconnectBtn) {
  disconnectBtn.addEventListener('click', async () => {
    try { await tonConnectUI.disconnect(); } finally { renderStatus(null); }
  });
}

// Стартовий рендер
renderStatus(tonConnectUI.wallet);
