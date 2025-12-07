import { validateInitData } from "./validateInitData.js";

const BOT_TOKEN = "123:ABC";

const initData = Telegram.WebApp.initData;

const isValid = validateInitData(initData, BOT_TOKEN);

if (!isValid) {
  alert("Invalid session");
  throw new Error("Invalid initData");
}

let clicks = 0;
document.getElementById("click").onclick = () => {
  clicks++;
  document.getElementById("count").innerText = clicks;
};
