import { state } from '../core/State.js';
import { UPGRADES, TIER_LABELS } from '../data/upgrades.js';
import { CONSUMABLES } from '../data/consumables.js';
import { purchaseUpgrade, hasUpgrade } from '../systems/UpgradeSystem.js';
import { buyConsumable } from '../systems/ConsumableSystem.js';
import { formatCurrency } from '../utils/math.js';

const tipsDisplay = document.getElementById("shop-tips-display");
const shopList    = document.getElementById("shop-list");

export function renderShop() {
    tipsDisplay.textContent = `Saved Tips: ${formatCurrency(state.savedTips)}`;
    shopList.innerHTML = "";

    // ---- CONSUMABLES SECTION ----
    const consumableHeader = document.createElement("div");
    consumableHeader.className = "shop-section-header";
    consumableHeader.textContent = "Consumables — stock up (max 1 use each per shift)";
    shopList.appendChild(consumableHeader);

    for (const c of CONSUMABLES) {
        const owned = c.id === "coffee" ? state.coffeeCount : state.powerBankCount;
        const affordable = state.savedTips >= c.cost;

        const div = document.createElement("div");
        div.className = "shop-item consumable";
        if (!affordable) div.classList.add("locked");

        div.innerHTML = `
            <div class="shop-item-name">${c.name} <span class="item-count">x${owned}</span></div>
            <div class="shop-item-desc">${c.desc}</div>
            <div class="shop-item-cost">Buy: ${formatCurrency(c.cost)}</div>
        `;

        if (affordable) {
            div.addEventListener("click", () => {
                if (buyConsumable(c.id)) {
                    console.log(`[Bought] ${c.name}`);
                    renderShop();
                }
            });
        }

        shopList.appendChild(div);
    }

    // ---- UPGRADES, GROUPED BY TIER ----
    const tiers = [...new Set(UPGRADES.map(u => u.tier))].sort((a, b) => a - b);

    for (const tier of tiers) {
        const header = document.createElement("div");
        header.className = "shop-section-header";
        header.textContent = TIER_LABELS[tier] || `Tier ${tier}`;
        shopList.appendChild(header);

        const tierUpgrades = UPGRADES.filter(u => u.tier === tier);

        for (const up of tierUpgrades) {
            const owned = hasUpgrade(up.id);
            const affordable = state.savedTips >= up.cost;

            const div = document.createElement("div");
            div.className = "shop-item";
            if (owned) div.classList.add("owned");
            else if (!affordable) div.classList.add("locked");

            div.innerHTML = `
                <div class="shop-item-name">${up.name}</div>
                <div class="shop-item-desc">${up.desc}</div>
                <div class="shop-item-cost">${owned ? "OWNED" : formatCurrency(up.cost)}</div>
            `;

            if (!owned && affordable) {
                div.addEventListener("click", () => {
                    if (purchaseUpgrade(up.id)) {
                        console.log(`[Purchased] ${up.name}`);
                        renderShop();
                    }
                });
            }

            shopList.appendChild(div);
        }
    }
}