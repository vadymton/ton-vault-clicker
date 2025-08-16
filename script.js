// server.js
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' })); // якщо хочеш — обмеж доменом GitHub Pages

const BOT_TOKEN = process.env.BOT_TOKEN;           // токен твого @TonMriyaBot
const BOT_API   = `https://api.telegram.org/bot${BOT_TOKEN}`;
const PROVIDER  = 'STARS';                         // для Telegram Stars

// Мапа товарів (sku -> назва та сума в XTR)
const SKU_MAP = {
  'chest_small':  { title: 'Скриня S', amount: 100 },
  'chest_medium': { title: 'Скриня M', amount: 500 },
  'chest_big':    { title: 'Скриня L', amount: 1000 }
};

// === Перевірка initData (за гайдом Telegram Web Apps)
function verifyInitData(initDataRaw) {
  // initData може бути рядком або об’єктом
  const params = new URLSearchParams(
    typeof initDataRaw === 'string'
      ? initDataRaw
      : Object.entries(initDataRaw).map(([k, v]) => [
          k,
          typeof v === 'object' ? JSON.stringify(v) : String(v)
        ])
  );

  const hash = params.get('hash');
  if (!hash) return false;

  const pairs = [];
  for (const [key, value] of params.entries()) {
    if (key === 'hash') continue;
    pairs.push(`${key}=${value}`);
  }
  pairs.sort();
  const dataCheckString = pairs.join('\n');

  // secretKey = HMAC_SHA256(key='WebAppData', data=BOT_TOKEN)
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(BOT_TOKEN)
    .digest();

  const calcHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(calcHash), Buffer.from(hash));
}

// Пінг (на здоровʼя)
app.get('/', (_req, res) => res.json({ ok: true }));

// Головний ендпоінт: створити інвойс Stars і повернути invoice_link
app.post('/api/create-stars-invoice', async (req, res) => {
  try {
    const { initData, sku, amount } = req.body;

    if (!BOT_TOKEN) {
      return res.status(500).json({ error: 'BOT_TOKEN is not set' });
    }
    if (!initData) {
      return res.status(400).json({ error: 'initData required' });
    }
    if (!verifyInitData(initData)) {
      return res.status(401).json({ error: 'initData verification failed' });
    }

    const item = SKU_MAP[sku] || { title: `Товар ${sku}`, amount: Number(amount || 0) };
    if (!item.amount || item.amount < 1 || !Number.isInteger(item.amount)) {
      return res.status(400).json({ error: 'Невірна сума XTR (потрібно ціле число)' });
    }

    const tgResp = await fetch(`${BOT_API}/createInvoiceLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Покупка: ${item.title}`,
        description: `TON Vault Clicker (${sku})`,
        payload: `sku:${sku}`,
        provider_token: PROVIDER,  // 'STARS'
        currency: 'XTR',           // зірки
        prices: [{ label: item.title, amount: item.amount }]
      })
    }).then(r => r.json());

    if (!tgResp?.ok) {
      return res.status(500).json({ error: 'Telegram API error', details: tgResp });
    }

    res.json({ invoice_link: tgResp.result });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Server error' });
  }
});

// Обробка підтвердження оплати в чаті бота (опційно webhook/long-poll)
// Якщо користуєш Telegraf — зроби окремо. Тут просто приклад pure Bot API webhook:
app.post('/telegram/webhook', async (req, res) => {
  try {
    const update = req.body;
    const msg = update.message;

    // successful_payment → нарахуй нагороду
    if (msg?.successful_payment) {
      const userId = msg.from.id;
      const sku = msg.successful_payment.invoice_payload?.replace('sku:', '');
      const amount = msg.successful_payment.total_amount; // в XTR
      // TODO: онови свою БД/нарахування
      await fetch(`${BOT_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: userId, text: `✅ Оплата за '${sku}' отримана: ${amount}⭐` })
      });
    }

    res.json({ ok: true });
  } catch (e) {
    res.json({ ok: false });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server on', PORT));
