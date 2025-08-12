// Telegram WebApp (в браузері просто не заважає)
const tg = window.Telegram?.WebApp;
tg?.ready?.();
tg?.expand?.();

// TonConnect UI — ВАЖЛИВО: правильний глобал і абсолютний manifestUrl
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
  manifestUrl: "https://vadymton.github.io/ton-vault-clicker/tonconnect-manifest.json",
  buttonRootId: "tc-root"
});

// Показуємо адресу
tonConnectUI.onStatusChange((wallet) => {
  const el = document.getElementById('addr');
  if (!el) return;
  const addr = wallet?.account?.address;
  el.textContent = addr ? `Підключено: ${addr}` : 'Гаманець не підключено';
});
