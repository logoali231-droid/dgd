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

// ---- Wipe gauntlet state ----
let wipeStage = 0; // 0 = idle button, 1-3 = confirmations, 4 = loading wipe

/** Show the current wipe stage */
function renderWipeStage() {
    wipeStageEl.innerHTML = "";

    if (wipeStage === 0) {
        wipeBtn.textContent = "🗑 Wipe Data";
        wipeBtn.classList.remove("hidden");
        return;
    }

    wipeBtn.classList.add("hidden");

    // Stages 1-3: escalating confirmations with checkbox + next/cancel buttons
    const stageConfigs = [{
        message: "This action cannot be undone.",
        checkboxLabel: "I understand this cannot be undone",
        nextLabel: "Next",
        onNext: () => { wipeStage = 2; renderWipeStage(); },
        onCancel: () => { wipeStage = 0; renderWipeStage(); }
    }, {
        message: `Are you SURE you wanna leave your chance of success? You've survived ${state.shiftsSurvived} shifts and saved $${state.savedTips.toFixed(2)}.`,
        checkboxLabel: "Yes, I really want to leave my chance of success",
        nextLabel: "Next",
        onNext: () => { wipeStage = 3; renderWipeStage(); },
        onCancel: () => { wipeStage = 0; renderWipeStage(); }
    }, {
        message: "FINAL WARNING. Every shift. Every upgrade. Every logbook entry. Gone forever. There is no appeal. No undo. No second chances.",
        checkboxLabel: "I accept that I will lose everything",
        nextLabel: "Yes, wipe everything",
        danger: true,
        onNext: () => { wipeStage = 4; renderWipeStage(); },
        onCancel: () => { wipeStage = 0; renderWipeStage(); }
    }];

    const cfg = stageConfigs[wipeStage - 1];

    // Message
    const msg = document.createElement("p");
    msg.className = "wipe-message" + (cfg.danger ? " danger" : "");
    msg.textContent = cfg.message;
    wipeStageEl.appendChild(msg);

    // Checkbox
    const wrap = document.createElement("label");
    wrap.className = "wipe-checkbox-wrap";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.id = "wipe-ack";
    wrap.appendChild(cb);
    wrap.appendChild(document.createTextNode(" " + cfg.checkboxLabel));
    wipeStageEl.appendChild(wrap);

    // Buttons
    const btnRow = document.createElement("div");
    btnRow.className = "wipe-button-row";

    const next = document.createElement("button");
    next.textContent = cfg.nextLabel;
    next.disabled = true;
    next.className = cfg.danger ? "wipe-next danger" : "wipe-next";
    btnRow.appendChild(next);

    const cancel = document.createElement("button");
    cancel.textContent = "Cancel";
    cancel.className = "wipe-cancel";
    btnRow.appendChild(cancel);

    wipeStageEl.appendChild(btnRow);

    // Enable Next only when checkbox is checked
    cb.addEventListener("change", () => {
        next.disabled = !cb.checked;
    });
    next.addEventListener("click", () => {
        if (cb.checked) cfg.onNext();
    });
    cancel.addEventListener("click", cfg.onCancel);
}

/** Final wipe: confirm, save, reload */
function performWipe() {
    // Safety: ensure wipeStage is 3 (final warning reached)
    if (wipeStage !== 4) return;

    // Reveal the wipe in progress state
    wipeStageEl.innerHTML = "";
    const msg = document.createElement("p");
    msg.className = "wipe-message danger";
    msg.textContent = "Wiping... Goodbye.";
    msg.style.fontSize = "8px";
    wipeStageEl.appendChild(msg);

    // Persist wipe, then reload page
    setTimeout(() => {
        Persistence.reset();
        // Force die cleanly (rewrite location to avoid any caching)
        location.href = "about:blank";
        setTimeout(() => location.reload(), 50);
    }, 1200);
}

// ---- Export ----
export function renderConfig() {
    soundBtn.textContent = `🔊 Sound: ${state.settings.soundOn ? "ON" : "OFF"}`;
    vibrationBtn.textContent = `📳 Vibration: ${state.settings.vibrationOn ? "ON" : "OFF"}`;
    wipeStage = 0;
    renderWipeStage();
}

export function bindConfigListeners() {
    soundBtn.addEventListener("click", () => {
        toggleSound();
        soundBtn.textContent = `🔊 Sound: ${state.settings.soundOn ? "ON" : "OFF"}`;
    });

    vibrationBtn.addEventListener("click", () => {
        toggleVibration();
        vibrationBtn.textContent = `📳 Vibration: ${state.settings.vibrationOn ? "ON" : "OFF"}`;
        if (state.settings.vibrationOn) {
            shakeScreen(1, 150);
        }
    });

    // Wipe button handlers — mouse, touch, keyboard
    wipeBtn.addEventListener("click", () => {
        if (wipeStage === 0) { wipeStage = 1; renderWipeStage(); }
    });

    wipeBtn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        if (wipeStage === 0) { wipeStage = 1; renderWipeStage(); }
    }, { passive: false });

    // Keyboard (Enter/Space) — via default button behavior + explicit handling
    wipeBtn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (wipeStage === 0) { wipeStage = 1; renderWipeStage(); }
        }
    });
}
