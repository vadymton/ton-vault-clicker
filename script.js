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

document.getElementById("close-button").onclick = () => tg.close();
