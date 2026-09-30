import { state } from '../core/State.js';
import { DEATH_REASONS } from '../data/deathReasons.js';

const progressEl = document.getElementById("logbook-progress");
const listEl     = document.getElementById("logbook-list");

/**
 * Category display names and order.
 */
const CATEGORY_LABELS = {
    condition: "Condition-Based",
    choice:    "Choice-Based",
    random:    "Random Events",
    algorithm: "Algorithm",
    physical:  "Physical World",
    food:      "Food Integrity",
    customer:  "Customer Encounters",
    timing:    "Time Crimes",
    quitting:  "Quitting Early",
    absurd:    "Absurd Anomalies"
};

/**
 * Group reasons by their type (condition/choice/random), then by category.
 */
function groupReasons() {
    const groups = {
        condition: {},
        choice:    {},
        random:    {}
    };

    for (const reason of DEATH_REASONS) {
        const t = reason.type;
        const c = reason.category || "unknown";
        if (!groups[t]) groups[t] = {};
        if (!groups[t][c]) groups[t][c] = [];
        groups[t][c].push(reason);
    }
    return groups;
}

export function renderLogbook() {
    // ---- Progress header ----
    const total = DEATH_REASONS.length;
    const collected = DEATH_REASONS.filter(r =>
        state.logbookEntries.includes(r.id)
    ).length;
    const pct = total > 0 ? Math.round((collected / total) * 100) : 0;
    progressEl.textContent = `${collected} / ${total} collected (${pct}%)`;

    // ---- List ----
    listEl.innerHTML = "";
    const groups = groupReasons();

    const typeOrder = ["condition", "choice", "random"];
    for (const type of typeOrder) {
        const typeGroup = groups[type];
        const categories = Object.keys(typeGroup).sort();

        for (const category of categories) {
            // Category header
            const header = document.createElement("div");
            header.className = "logbook-category";
            const typeLabel = CATEGORY_LABELS[type] || type;
            const catLabel  = CATEGORY_LABELS[category] || category;
            header.textContent = `${typeLabel} · ${catLabel}`;
            listEl.appendChild(header);

            // Entries
            for (const reason of typeGroup[category]) {
                listEl.appendChild(buildEntry(reason));
            }
        }
    }
}

function buildEntry(reason) {
    const unlocked = state.logbookEntries.includes(reason.id);
    const survival = state.survivalMap[reason.id] ?? reason.baseSurvival ?? 0;
    const survivalPct = Math.round(survival * 100);

    const entry = document.createElement("div");
    entry.className = "logbook-entry " + (unlocked ? "unlocked" : "locked");

    // ID line — show real ID if unlocked, "???" otherwise
    const idLine = document.createElement("div");
    idLine.className = "logbook-entry-id";
    idLine.textContent = unlocked ? `#${reason.id}` : `#???`;
    entry.appendChild(idLine);

    // Text line — show text if unlocked, otherwise dots
    const textLine = document.createElement("div");
    textLine.className = "logbook-entry-text";
    if (unlocked) {
        textLine.textContent = reason.text;
    } else {
        textLine.textContent = "· · · · · · · · · · · · · · · ·";
    }
    entry.appendChild(textLine);

    // Survival bar
    const survLine = document.createElement("div");
    survLine.className = "logbook-survival " + (survivalPct >= 100 ? "full" : "");
    survLine.textContent = `Survival: ${survivalPct}%`;

    const survBar = document.createElement("div");
    survBar.className = "logbook-survival-bar";
    const survFill = document.createElement("div");
    survFill.className = "logbook-survival-fill " + (survivalPct >= 100 ? "full" : "");
    survFill.style.width = `${Math.min(survivalPct, 100)}%`;
    survBar.appendChild(survFill);

    entry.appendChild(survLine);
    entry.appendChild(survBar);

    return entry;
}