import { state, saveMeta } from '../core/State.js';
import { Persistence } from '../core/Persistence.js';
import { toggleSound, toggleVibration } from '../systems/Settings.js';
import { shakeScreen } from '../utils/screenShake.js';

// ---- DOM ----
const soundBtn       = document.getElementById("config-sound-btn");
const vibrationBtn   = document.getElementById("config-vibration-btn");
const wipeRoot       = document.getElementById("wipe-root");
const wipeBtn        = document.getElementById("wipe-btn");
const wipeStageEl    = document.getElementById("wipe-stage");

// ---- WIPE GAUNTLET STATE ----
// 0 = idle button. 1-3 = escalating confirmations. 4 = final wipe.
let wipeStage = 0;

export function renderConfig() {
    soundBtn.textContent = `🔊 Sound: ${state.settings.soundOn ? "ON" : "OFF"}`;
    vibrationBtn.textContent = `📳 Vibration: ${state.settings.vibrationOn ? "ON" : "OFF"}`;

    // Reset the gauntlet any time we enter config
    wipeStage = 0;
    renderWipeStage();
}

function renderWipeStage() {
    // Clear prior staged content
    wipeStageEl.innerHTML = "";

    if (wipeStage === 0) {
        wipeBtn.textContent = "🗑 Wipe Data";
        wipeBtn.classList.remove("hidden");
        return;
    }

    // Stage 1–3: escalating confirmations. Hide the raw button.
    wipeBtn.classList.add("hidden");

    if (wipeStage === 1) {
        renderConfirmStep({
            message: "This action cannot be undone.",
            checkboxLabel: "I understand this cannot be undone",
            nextLabel: "Next",
            onNext: () => { wipeStage = 2; renderWipeStage(); },
            onCancel: () => { wipeStage = 0; renderWipeStage(); }
        });
    }
    else if (wipeStage === 2) {
        renderConfirmStep({
            message: `Are you SURE you wanna leave your chance of success? You've survived ${state.shiftsSurvived} shifts and saved ${"$" + state.savedTips.toFixed(2)}.`,
            checkboxLabel: "Yes, I really want to leave my chance of success",
            nextLabel: "Next",
            onNext: () => { wipeStage = 3; renderWipeStage(); },
            onCancel: () => { wipeStage = 0; renderWipeStage(); }
        });
    }
    else if (wipeStage === 3) {
        renderConfirmStep({
            message: "FINAL WARNING. Every shift. Every upgrade. Every logbook entry. Gone forever. There is no appeal. No undo. No second chances.",
            checkboxLabel: "I accept that I will lose everything",
            nextLabel: "Yes, wipe everything",
            danger: true,
            onNext: () => { actuallyWipe(); },
            onCancel: () => { wipeStage = 0; renderWipeStage(); }
        });
    }
}

function renderConfirmStep({ message, checkboxLabel, nextLabel, danger, onNext, onCancel }) {
    // Message
    const msg = document.createElement("p");
    msg.className = "wipe-message";
    msg.textContent = message;
    if (danger) msg.classList.add("danger");
    wipeStageEl.appendChild(msg);

    // Checkbox
    const wrap = document.createElement("label");
    wrap.className = "wipe-checkbox-wrap";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.id = "wipe-ack";
    wrap.appendChild(cb);
    wrap.appendChild(document.createTextNode(" " + checkboxLabel));
    wipeStageEl.appendChild(wrap);

    // Buttons
    const btnRow = document.createElement("div");
    btnRow.className = "wipe-button-row";

    const next = document.createElement("button");
    next.textContent = nextLabel;
    next.disabled = true;
    next.className = danger ? "wipe-next danger" : "wipe-next";
    btnRow.appendChild(next);

    const cancel = document.createElement("button");
    cancel.textContent = "Cancel";
    cancel.className = "wipe-cancel";
    btnRow.appendChild(cancel);

    wipeStageEl.appendChild(btnRow);

    // Enable Next only when checkbox checked
    cb.addEventListener("change", () => {
        next.disabled = !cb.checked;
    });

    next.addEventListener("click", () => {
        if (cb.checked) onNext();
    });
    cancel.addEventListener("click", onCancel);
}

function actuallyWipe() {
    // Optional shake for drama
    shakeScreen(3, 500);

    wipeStageEl.innerHTML = "";
    const msg = document.createElement("p");
    msg.className = "wipe-message danger";
    msg.textContent = "Wiping... Goodbye.";
    wipeStageEl.appendChild(msg);

    // Persist wipe, then reload page (cleanest reset — reloads state module)
    setTimeout(() => {
        Persistence.reset();
        location.reload();
    }, 1200);
}

// ---- Event listeners ----
export function bindConfigListeners() {
    soundBtn.addEventListener("click", () => {
        toggleSound();
        soundBtn.textContent = `🔊 Sound: ${state.settings.soundOn ? "ON" : "OFF"}`;
    });

    vibrationBtn.addEventListener("click", () => {
        toggleVibration();
        vibrationBtn.textContent = `📳 Vibration: ${state.settings.vibrationOn ? "ON" : "OFF"}`;
        // Give feedback
        if (state.settings.vibrationOn) shakeScreen(1, 200);
    });

    // Hover shenanigans
    wipeBtn.addEventListener("mouseenter", () => {
        if (wipeStage === 0) wipeBtn.textContent = "DON'T!";
    });
    wipeBtn.addEventListener("mouseleave", () => {
        if (wipeStage === 0) wipeBtn.textContent = "🗑 Wipe Data";
    });
    wipeBtn.addEventListener("touchstart", () => {
        if (wipeStage === 0) wipeBtn.textContent = "DON'T!";
    }, { passive: true });

    wipeBtn.addEventListener("click", () => {
        if (wipeStage === 0) { wipeStage = 1; renderWipeStage(); }
    });
}