import { startGameLoop } from './src/core/GameLoop.js';
import { state, resetShiftCounters } from './src/core/State.js';
import { showGame, showStart, showShop, showConfig, showDeactivated } from './src/ui/ScreenManager.js';
import { resetOrderManager } from './src/systems/OrderManager.js';
import { resetDialogueSystem } from './src/systems/DialogueSystem.js';
import { resetRun, startNextShift } from './src/systems/UpgradeSystem.js';
import { renderShop } from './src/ui/ShopUI.js';
import { useCoffee, usePowerBank } from './src/systems/ConsumablesSystem.js';
import { snapshotPositions } from './src/ui/ShiftCompleteUI.js';
import { showLogbook } from './src/ui/ScreenManager.js';
import { renderLogbook } from './src/ui/LogbookUI.js';
import { unlockAudio, SFX } from './src/systems/AudioManager.js';
import { preloadSprites, ASSETS } from './src/assets.js';
import { renderCareerHub } from './src/ui/CareerHubUI.js';
import { renderConfig, bindConfigListeners } from './src/ui/ConfigUI.js';

// ---- Audio unlock: promise-based loader ----
let audioUnlocked = false;

async function initAudio() {
    try {
        await new Promise((resolve) => {
            // Preload audio context etc.
            unlockAudio();
            audioUnlocked = true;
            // Try playing a silent buffer to ensure context is unlocked
            const test = new Audio();
            test.volume = 0;
            test.play().then(() => resolve()).catch(() => resolve());
        });
    } catch (e) {
        console.warn("Audio init failed:", e);
    }
}

window.state = state;

// ---- Preload known assets ----
const PRIORITY_SPIRTS = [
    ASSETS.sprites.items.pizza_box,
    ASSETS.sprites.items.coffee_cup,
    ASSETS.sprites.items.generic_bag,
    ASSETS.sprites.characters.player_bike_pedaling,
];

// ---- DOM refs ----
const startButton      = document.getElementById("start-btn");
const restartBtn       = document.getElementById("restart-btn");
const shopContinueBtn  = document.getElementById("shop-continue-btn");
const nextShiftBtn     = document.getElementById("next-shift-btn");
const shiftShopBtn     = document.getElementById("shift-shop-btn");
const useCoffeeBtn     = document.getElementById("use-coffee-btn");
const usePowerBankBtn  = document.getElementById("use-powerbank-btn");
const coffeeCountEl    = document.getElementById("coffee-count");
const powerBankCountEl = document.getElementById("powerbank-count");
const logbookBtn       = document.getElementById("logbook-btn");
const logbookBackBtn   = document.getElementById("logbook-back-btn");
const shopStartBtn     = document.getElementById("shop-start-btn");
const configBtn        = document.getElementById("config-btn");
const configBackBtn    = document.getElementById("config-back-btn");
const loadingOverlay   = document.getElementById("loading-overlay");
const gameContainer    = document.getElementById("game-container");
const toastContainer   = document.getElementById("toast-container");

// ---- Toast notification system ----
function showToast(message, duration = 2200, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    // Trigger reflow for animation
    void toast.offsetWidth;

    setTimeout(() => {
        toast.classList.add("out");
        setTimeout(() => toast.remove(), 200);
    }, duration);
}

// ---- Consumables bar ----
export function refreshConsumableBar() {
    const coffeeDisabled = state.shiftCoffeeUsed || state.coffeeCount <= 0;
    const bankDisabled   = state.shiftPowerBankUsed || state.powerBankCount <= 0;

    if (state.shiftCoffeeUsed) {
        useCoffeeBtn.textContent = "☕ Used this shift";
    } else {
        useCoffeeBtn.innerHTML = `☕ Coffee <span id="coffee-count">x${state.coffeeCount}</span>`;
    }
    if (state.shiftPowerBankUsed) {
        usePowerBankBtn.textContent = "🔋 Used this shift";
    } else {
        usePowerBankBtn.innerHTML = `🔋 Power Bank <span id="powerbank-count">x${state.powerBankCount}</span>`;
    }

    useCoffeeBtn.disabled = coffeeDisabled;
    usePowerBankBtn.disabled = bankDisabled;
}

useCoffeeBtn.addEventListener("click", () => {
    const result = useCoffee();
    if (result.ok) {
        refreshConsumableBar();
        showToast("☕ Coffee refreshed your energy!", 1200);
    } else if (result.reason === "already-used") {
        showToast("Coffee already used this shift.", 1200);
    } else {
        showToast("No coffee in stock.", 1200);
    }
});

usePowerBankBtn.addEventListener("click", () => {
    const result = usePowerBank();
    if (result.ok) {
        refreshConsumableBar();
        showToast("🔋 Power bank restored your battery!", 1200);
    } else if (result.reason === "already-used") {
        showToast("Power bank already used this shift.", 1200);
    } else {
        showToast("No power bank in stock.", 1200);
    }
});

// ---- Start shift flow ----
startButton.addEventListener("click", async () => {
    await initAudio();
    resetRun();
    resetShiftCounters();
    snapshotPositions();
    refreshConsumableBar();
    showGame();
    startGameLoop();
    showToast("🚴 Shift started! Hold pedal and dodge hazards.", 1500);
});

// ---- Next shift flow ----
nextShiftBtn.addEventListener("click", () => {
    startNextShift();
    resetShiftCounters();
    refreshConsumableBar();
    showGame();
    startGameLoop();
    showToast("✅ Shift complete! Keep going.", 1500);
});

// ---- Shop navigation ----
shopStartBtn.addEventListener("click", () => { renderShop(); showShop(); showToast("🛒 Shop opened.", 800); });
shiftShopBtn.addEventListener("click", () => { renderShop(); showShop(); showToast("🛒 Shop opened.", 800); });
shopContinueBtn.addEventListener("click", goToHub);

// ---- Death → Shop ----
restartBtn.addEventListener("click", () => {
    resetOrderManager();
    resetDialogueSystem();
    renderShop();
    showShop();
    showToast("📖 Back at the shop.", 800);
});

// ---- Logbook ----
logbookBtn.addEventListener("click", () => { renderLogbook(); showLogbook(); showToast("📖 Deactivation Log opened.", 800); });
logbookBackBtn.addEventListener("click", goToHub);

// ---- Config ----
configBtn.addEventListener("click", () => { renderConfig(); showConfig(); showToast("⚙️ Settings opened."); });
configBackBtn.addEventListener("click", goToHub);

// Bind config listeners once
bindConfigListeners();

// ---- Hub helper ----
function goToHub() {
    renderCareerHub();
    showStart();
    showToast("🚴 Welcome back.", 800);
}

// ---- Init: show loading overlay, preload assets, then hide ----
(async function init() {
    loadingOverlay.classList.remove("hidden");

    try {
        await preloadSprites(PRIORITY_SPIRTS);
        // Additional non-critical assets can be lazy-loaded
    } catch (e) {
        console.warn("Preload failed:", e);
    } finally {
        loadingOverlay.classList.add("hidden");
        goToHub();
    }
})();

// ---- Keyboard navigation polish ----
document.addEventListener("keydown", (e) => {
    // Escape to go back to hub (from any screen)
    if (e.key === "Escape") {
        const visible = document.querySelector(".screen:not(.hidden)");
        if (visible && visible.id !== "screen-start") {
            goToHub();
        }
    }
});
