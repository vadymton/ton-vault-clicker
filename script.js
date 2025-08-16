
// ===== FRONT (WebApp) =====
const tg = window.Telegram.WebApp;
tg.ready(); tg.expand();

const user = tg.initDataUnsafe?.user;
const u = document.getElementById('user');
if (u) u.textContent = user ? `Привіт, ${user.first_name}!` : 'Привіт!';

function setStatus(t){ const el = document.getElementById('buy-status'); if(el) el.textContent = t; }

// 👉 ПІДСТАВИ СВІЙ БЕК ПІСЛЯ ДЕПЛОЮ (Крок 3)
const BACKEND_URL = 'https://YOUR_BACKEND_HOST';

async function buyStars(sku, amountXTR){
  try {
    setStatus('Готуємо інвойс…');
    const resp = await fetch(`${BACKEND_URL}/api/create-stars-invoice`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        initData: tg.initData || tg.initDataUnsafe,
        sku,
        amount: amountXTR
      })
    });
    const data = await resp.json();
    if(!resp.ok || !data.invoice_link) throw new Error(data.error || 'Немає invoice_link');

    tg.openInvoice(data.invoice_link, (status) => {
      if (status === 'paid') setStatus('✅ Оплачено!');
      else if (status === 'failed') setStatus('❌ Помилка оплати');
      else if (status === 'cancelled') setStatus('❌ Платіж скасовано');
      else setStatus('⏳ Очікуємо підтвердження…');
    });
  } catch(e){
    setStatus('❌ ' + (e.message || 'Помилка'));
  }
}

document.querySelectorAll('.buy').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const sku = btn.dataset.sku;
    const amount = parseInt(btn.dataset.amount,10);
    if(!sku || !amount) return setStatus('❌ Невірні дані товару');
    buyStars(sku, amount);
  });
});
