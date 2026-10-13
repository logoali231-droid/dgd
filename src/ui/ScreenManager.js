import { renderDeathAlgorithmMessage } from "./AlgorithmUI.js";

const configScreen = document.getElementById("screen-config");
const startScreen = document.getElementById("screen-start");
const gameScreen = document.getElementById("screen-game");
const shopScreen = document.getElementById("screen-shop");
const shiftCompleteScreen = document.getElementById("screen-shift-complete");
const logbookScreen = document.getElementById("screen-logbook");
const deactivatedScreen = document.getElementById("screen-deactivated");

const restartBtn = document.getElementById("restart-btn");
const deactivatedReasonEl = document.getElementById("deactivated-reason");
const deactivatedTextEl = document.getElementById("deactivated-text");

const screens = [
  startScreen,
  gameScreen,
  shopScreen,
  shiftCompleteScreen,
  logbookScreen,
  configScreen, // ← new
  deactivatedScreen,
];

function showScreen(target) {
  for (const s of screens) s.classList.add("hidden");

  if (target === "start") startScreen.classList.remove("hidden");
  else if (target === "game") gameScreen.classList.remove("hidden");
  else if (target === "shop") shopScreen.classList.remove("hidden");
  else if (target === "shiftComplete")
    shiftCompleteScreen.classList.remove("hidden");
  else if (target === "logbook") logbookScreen.classList.remove("hidden");
  else if (target === "deactivated")
    deactivatedScreen.classList.remove("hidden");
  else if (target === "config") configScreen.classList.remove("hidden");
}

export function showStart() {
  showScreen("start");
}
export function showGame() {
  showScreen("game");
}
export function showShop() {
  showScreen("shop");
}
export function showShiftComplete() {
  showScreen("shiftComplete");
}
export function showLogbook() {
  showScreen("logbook");
}
export function showDeactivated() {
  showScreen("deactivated");
}
export function showConfig() {
  showScreen("config");
}

export function triggerDeactivation(reason) {
  deactivatedReasonEl.textContent = `Reason: ${reason.id}`;
  deactivatedTextEl.textContent = reason.text;
  showDeactivated();
  renderDeathAlgorithmMessage();
}
