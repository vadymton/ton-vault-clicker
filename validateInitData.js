import crypto from "crypto-js";

export function validateInitData(initData, botToken) {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  params.delete("hash");

  const arr = [];
  for (const [key, value] of params.entries()) {
    arr.push(`${key}=${value}`);
  }

  const dataCheckString = arr.sort().join("\n");

  const secretKey = crypto.HmacSHA256(botToken, "WebAppData");
  const calculatedHash = crypto.HmacSHA256(dataCheckString, secretKey).toString();

  return calculatedHash === hash;
}
