import { state } from "../core/State.js";
import { randomInt, formatCurrency, clamp } from "../utils/math.js";
import { getRandomFood } from "../data/food.js";
import { getRandomNeighborhood } from "../data/neighborhoods.js";
import { updatePositions, getActiveEffect } from "./PositionTracker.js";
import { SFX } from "./AudioManager.js";
import { updateHazardSystem, resetHazards, notifyPedalReleased, notifyPedalHeld } from "./HazardSystem.js";

// ---- DOM ----
const orderCard       = document.getElementById("order-card");
const restaurantEl    = document.getElementById("order-restaurant");
const distanceEl      = document.getElementById("order-distance");
const customerEl      = document.getElementById("order-customer");
const payEl           = document.getElementById("order-pay");
const foodEl          = document.getElementById("order-food");
const actionsEl       = document.getElementById("order-actions");
const acceptBtn       = document.getElementById("accept-btn");
const declineBtn      = document.getElementById("decline-btn");
const statusTextEl    = document.getElementById("game-status-text");

const deliveryPanel   = document.getElementById("delivery-panel");
const deliveryFoodEl  = document.getElementById("delivery-food");
const deliveryTimerEl = document.getElementById("delivery-timer");
const pedalBtn        = document.getElementById("pedal-btn");
const deliverBtn      = document.getElementById("deliver-btn");
const boostBtn        = document.getElementById("boost-btn");
const progressFill    = document.getElementById("progress-fill");
const progressText    = document.getElementById("progress-text");
const enduranceFill   = document.getElementById("endurance-fill");
const enduranceText   = document.getElementById("endurance-text");

// ---- CONFIG ----
const ORDER_DECISION_TIME = 6;
const BOOST_DURATION      = 5.0;
const BASE_PEDAL_RATE     = 40;     // progress units per second
const ENDURANCE_DRAIN     = 18;     // per second while holding
const ENDURANCE_RECOVER   = 30;     // per second while released
const STALL_PENALTY       = 2.0;    // seconds pedal disabled after overexertion
const WEAR_PER_HIT        = 0.08;   // 8% pedal rate lost per hazard hit

// ---- ORDER STATE ----
let currentOrder = null;
let orderTimeLeft = 0;
let nextOrderIn = 3;
let lastFoodId = null;
let bikeWear = 0;  // 0.0 = fresh bike, each hazard hit adds 0.08

// ---- RESTAURANTS ----
const RESTAURANTS = [
    "Sushi Palace", "Burger Barn", "Taco Tornado", "Noodle House",
    "Pizza Prime", "Curry Corner", "Donut Diner", "Ramen Rush"
];

function generateOrder() {
    const restaurant   = RESTAURANTS[randomInt(0, RESTAURANTS.length - 1)];
    const neighborhood = getRandomNeighborhood();
    const customerName = `Customer #${randomInt(1000, 9999)}`;

    let food;
    do { food = getRandomFood(); } while (food.id === lastFoodId);
    lastFoodId = food.id;

    const basePay = randomInt(5, 18);
    const payAmount = Math.round(basePay * food.payMultiplier * neighborhood.payMult);

    return { restaurant, neighborhood, customerName, food, payAmount };
}

function spawnOrder() {
    if (currentOrder !== null) return;
    if (state.currentDelivery !== null) return;
    resetHazards();

    currentOrder = generateOrder();
    orderTimeLeft = ORDER_DECISION_TIME;

    foodEl.textContent = `${currentOrder.food.emoji} ${currentOrder.food.name} (cold in ~${currentOrder.food.coldTime}s)`;
    restaurantEl.textContent = currentOrder.restaurant;
    distanceEl.textContent = `${currentOrder.neighborhood.distanceLabel} · ${currentOrder.neighborhood.name}`;
    distanceEl.className = `distance-${currentOrder.neighborhood.distance}`;
    customerEl.textContent = currentOrder.customerName;
    payEl.textContent = formatCurrency(currentOrder.payAmount);
    statusTextEl.textContent = "NEW ORDER — Decide now!";
    SFX.orderDing();
    actionsEl.classList.remove("hidden");
    orderCard.classList.remove("hidden");
}

function dismissOrder() {
    currentOrder = null;
    orderTimeLeft = 0;
    actionsEl.classList.add("hidden");
    orderCard.classList.add("hidden");
}

// ---- PEDAL STATE ----
function setPedalHeld(held) {
    const d = state.currentDelivery;
    if (!d) return;
    if (state.pedalStallTime > 0) return;  // stalled
    if (!held && state.pedalEndurance <= 0) return; // can't restart empty
    if (held && d.progress >= d.distance) return;   // already done

    if (held === state.pedalHeld) return;  // no change

    state.pedalHeld = held;
    pedalBtn.classList.toggle("pedaling", held);

    if (held) notifyPedalHeld();
    else      notifyPedalReleased();
}

// ---- DELIVERY UI ----
function updateDeliveryUI() {
    const d = state.currentDelivery;
    if (!d) return;

    if (state.boostActive) {
        deliveryTimerEl.textContent = `${Math.ceil(d.timeLeft)}s 🚀`;
        deliveryTimerEl.classList.add("boosting");
        deliveryTimerEl.classList.remove("cold");
    } else if (d.timeLeft > 0) {
        deliveryTimerEl.textContent = `${Math.ceil(d.timeLeft)}s`;
        deliveryTimerEl.classList.remove("boosting", "cold");
    } else {
        deliveryTimerEl.textContent = `COLD · ${Math.ceil(-d.timeLeft)}s late`;
        deliveryTimerEl.classList.remove("boosting");
        deliveryTimerEl.classList.add("cold");
    }

    const pct = Math.min((d.progress / d.distance) * 100, 100);
    progressFill.style.width = `${pct}%`;
    progressText.textContent = `${Math.min(Math.round(d.progress), d.distance)} / ${d.distance}`;

    enduranceFill.style.width = `${state.pedalEndurance}%`;
    enduranceFill.classList.toggle("depleted", state.pedalEndurance <= 0);
    enduranceText.textContent = state.pedalStallTime > 0
        ? `STALLED — ${state.pedalStallTime.toFixed(1)}s`
        : `Endurance ${Math.round(state.pedalEndurance)}%`;

    deliverBtn.disabled = d.progress < d.distance;

    // Pedal button visual state
    pedalBtn.classList.toggle("stalled", state.pedalStallTime > 0);
    pedalBtn.disabled = state.pedalStallTime > 0;

    updateBoostButton();
}

function updateBoostButton() {
    if (!state.currentDelivery) return;

    if (state.boostActive) {
        boostBtn.textContent = `🚀 ${state.boostTimeLeft.toFixed(1)}s`;
        boostBtn.className = "boost-active";
        boostBtn.disabled = true;
    } else if (state.boostUsedThisDelivery) {
        boostBtn.textContent = "🚀 Used";
        boostBtn.className = "boost-used";
        boostBtn.disabled = true;
    } else {
        boostBtn.textContent = "🚀 Boost";
        boostBtn.className = "";
        boostBtn.disabled = false;
    }
}

// ---- BUTTON HANDLERS ----
function handleAccept() {
    if (!currentOrder) return;

    state.currentDelivery = {
        food: currentOrder.food,
        restaurant: currentOrder.restaurant,
        neighborhood: currentOrder.neighborhood,
        customerName: currentOrder.customerName,
        payAmount: currentOrder.payAmount,
        timeLeft: currentOrder.food.coldTime,
        totalTime: currentOrder.food.coldTime,
        progress: 0,
        distance: currentOrder.neighborhood.progress
    };

    state.pedalHeld = false;
    state.pedalEndurance = 100;
    state.pedalStallTime = 0;
    state.boostActive = false;
    state.boostTimeLeft = 0;
    state.boostUsedThisDelivery = false;

    resetHazards();
    dismissOrder();

    deliveryFoodEl.textContent = `${state.currentDelivery.food.emoji} ${state.currentDelivery.food.name}`;
    deliveryPanel.classList.remove("hidden");
    pedalBtn.textContent = "🚴 HOLD TO PEDAL";
    pedalBtn.classList.remove("pedaling", "stalled");
    updateDeliveryUI();
    statusTextEl.textContent = "Hold PEDAL. Release to brake for hazards.";
}

function handleDecline() {
    if (currentOrder) state.streakStats.ordersDeclined += 1;
    dismissOrder();
    statusTextEl.textContent = "Order declined. Waiting...";
}

function handleDeliver() {
    const d = state.currentDelivery;
    if (!d) return;
    if (d.progress < d.distance) return;

    let earned, ratingDelta, message;

    if (d.timeLeft > 0) {
        earned = d.payAmount;
        ratingDelta = 0.1;
        message = "On time! Customer is happy.";
    } else {
        const lateness = -d.timeLeft;
        const payFactor = Math.max(0.2, 1 - lateness / 30);
        earned = Math.round(d.payAmount * payFactor);
        ratingDelta = -0.5;
        message = `Late by ${Math.round(lateness)}s. Food went cold.`;
    }

    const cashMult = getActiveEffect("cashMultiplier");
    if (cashMult !== null) earned = Math.round(earned * cashMult);

    const ratingBonus = getActiveEffect("ratingPerDelivery");
    if (ratingBonus !== null && ratingDelta >= 0) ratingDelta += ratingBonus;

    const ratingLossReduction = getActiveEffect("ratingLossReduction");
    if (ratingLossReduction !== null && ratingDelta < 0) {
        ratingDelta = ratingDelta * (1 - ratingLossReduction);
    }

    state.cash += earned;
    SFX.cashRegister();
    state.rating = clamp(state.rating + ratingDelta, 0, 5);
    state.deliveriesThisShift += 1;
    state.streakStats.deliveries += 1;
    if (ratingDelta < 0) state.currentShiftWasPerfect = false;

    const ratingText = ratingDelta >= 0 ? `+${ratingDelta.toFixed(1)}` : ratingDelta.toFixed(1);
    statusTextEl.textContent = `${message} Earned $${earned}. Rating ${ratingText}`;

    updatePositions();

    state.currentDelivery = null;
    state.pedalHeld = false;
    state.boostActive = false;
    state.boostTimeLeft = 0;
    state.boostUsedThisDelivery = false;
    deliveryPanel.classList.add("hidden");
    resetHazards();
    nextOrderIn = 3;
}

function handleBoost() {
    if (!state.currentDelivery) return;
    if (state.boostUsedThisDelivery) return;
    if (state.boostActive) return;

    state.boostActive = true;
    state.boostTimeLeft = BOOST_DURATION;
    state.boostUsedThisDelivery = true;
    SFX.bikeBell();
    updateBoostButton();
}

// ---- PEDAL LISTENERS (mouse + touch + keyboard) ----
function pedalDown(e) {
    if (e) e.preventDefault();
    setPedalHeld(true);
}
function pedalUp(e) {
    if (e) e.preventDefault();
    setPedalHeld(false);
}

pedalBtn.addEventListener("mousedown", pedalDown);
pedalBtn.addEventListener("mouseup", pedalUp);
pedalBtn.addEventListener("mouseleave", pedalUp);
pedalBtn.addEventListener("touchstart", pedalDown, { passive: false });
pedalBtn.addEventListener("touchend", pedalUp, { passive: false });
pedalBtn.addEventListener("touchcancel", pedalUp, { passive: false });

// Spacebar accessibility — hold space to pedal
window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && state.currentDelivery && !state.pedalStallTime) {
        e.preventDefault();
        setPedalHeld(true);
    }
});
window.addEventListener("keyup", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        setPedalHeld(false);
    }
});

acceptBtn.addEventListener("click", handleAccept);
declineBtn.addEventListener("click", handleDecline);
deliverBtn.addEventListener("click", handleDeliver);
boostBtn.addEventListener("click", handleBoost);

// ---- PER-FRAME UPDATE ----
export function updateOrderManager(deltaTime) {
    // ---- ACTIVE DELIVERY ----
    if (state.currentDelivery) {
        const d = state.currentDelivery;

        // Stall timer
        if (state.pedalStallTime > 0) {
            state.pedalStallTime -= deltaTime;
            if (state.pedalStallTime <= 0) {
                state.pedalStallTime = 0;
                state.pedalEndurance = 40; // recover a bit on stall end
            }
        }

        // Boost timer
        if (state.boostActive) {
            state.boostTimeLeft -= deltaTime;
            if (state.boostTimeLeft <= 0) {
                state.boostActive = false;
                state.boostTimeLeft = 0;
            }
        }

        // Endurance + progress
        if (state.pedalHeld && state.pedalStallTime <= 0 && d.progress < d.distance) {
            // Endurance drains
            state.pedalEndurance -= ENDURANCE_DRAIN * deltaTime;
            if (state.pedalEndurance <= 0) {
                state.pedalEndurance = 0;
                // Overexertion: forced stall, no more pedaling
                state.pedalHeld = false;
                pedalBtn.classList.remove("pedaling");
                state.pedalStallTime = STALL_PENALTY;
                notifyPedalReleased();
            } else {
                // Progress fills — slower with wear, faster with boost
                const wearMult = 1 - bikeWear;
                const boostMult = state.boostActive ? 2 : 1;
                d.progress += BASE_PEDAL_RATE * wearMult * boostMult * deltaTime;
                if (d.progress > d.distance) d.progress = d.distance;
            }
        } else if (!state.pedalHeld) {
            // Recover endurance
            state.pedalEndurance = Math.min(100, state.pedalEndurance + ENDURANCE_RECOVER * deltaTime);
        }

        // Delivery timer (cold food)
        const drainRate = state.boostActive ? (1 / 1.5) : 1.0;
        d.timeLeft -= deltaTime * drainRate;

        updateHazardSystem(deltaTime);
        updateDeliveryUI();
        return;
    }

    // ---- ORDER PENDING ----
    if (currentOrder !== null) {
        orderTimeLeft -= deltaTime;
        statusTextEl.textContent = `NEW ORDER — ${Math.ceil(orderTimeLeft)}s`;
        if (orderTimeLeft <= 0) dismissOrder();
        return;
    }

    // ---- IDLE ----
    nextOrderIn -= deltaTime;
    if (nextOrderIn <= 0) {
        spawnOrder();
        nextOrderIn = randomInt(4, 8);
    }
}

// ---- RESET ----
export function resetOrderManager() {
    currentOrder = null;
    orderTimeLeft = 0;
    nextOrderIn = 3;
    state.currentDelivery = null;
    state.pedalHeld = false;
    state.pedalEndurance = 100;
    state.pedalStallTime = 0;
    state.boostActive = false;
    state.boostTimeLeft = 0;
    state.boostUsedThisDelivery = false;
    state.deliveriesThisShift = 0;
    bikeWear = 0;
    actionsEl.classList.add("hidden");
    orderCard.classList.add("hidden");
    deliveryPanel.classList.add("hidden");
    resetHazards();
}

// Expose bike wear to other systems
export function getBikeWear() { return bikeWear; }
export function addBikeWear(amount) { bikeWear = Math.min(bikeWear + amount, 0.5); }
export { WEAR_PER_HIT };