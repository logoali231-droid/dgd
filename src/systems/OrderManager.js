import { state } from "../core/State.js";
import { randomInt, formatCurrency, clamp } from "../utils/math.js";
import { getRandomFood } from "../data/foods.js";
import { getRandomNeighborhood } from "../data/neighborhoods.js";
import { updatePositions, getActiveEffect } from "./PositionTracker.js";

// ---- DOM ELEMENTS ----
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
const deliverBtn      = document.getElementById("deliver-btn");
const boostBtn        = document.getElementById("boost-btn");

// ---- CONFIG ----
const ORDER_DECISION_TIME = 6;
const BOOST_DURATION      = 5.0;      // real seconds
const BOOST_SPEED         = 1.5;      // timer drains at 1/1.5 rate

// ---- ORDER STATE ----
let currentOrder = null;
let orderTimeLeft = 0;
let nextOrderIn = 3;
let lastFoodId = null;

// ---- RESTAURANTS ----
const RESTAURANTS = [
    "Sushi Palace", "Burger Barn", "Taco Tornado", "Noodle House",
    "Pizza Prime", "Curry Corner", "Donut Diner", "Ramen Rush"
];

// ---- GENERATE ORDER ----
function generateOrder() {
    const restaurant   = RESTAURANTS[randomInt(0, RESTAURANTS.length - 1)];
    const neighborhood = getRandomNeighborhood();
    const customerName = `Customer #${randomInt(1000, 9999)}`;

    let food;
    do { food = getRandomFood(); } while (food.id === lastFoodId);
    lastFoodId = food.id;

    // Pay scales with food risk AND distance
    const basePay = randomInt(5, 18);
    const payAmount = Math.round(basePay * food.payMultiplier * neighborhood.payMult);

    return { restaurant, neighborhood, customerName, food, payAmount };
}

// ---- SHOW ORDER ----
function spawnOrder() {
    if (currentOrder !== null) return;
    if (state.currentDelivery !== null) return;

    currentOrder = generateOrder();
    orderTimeLeft = ORDER_DECISION_TIME;

    foodEl.textContent = `${currentOrder.food.emoji} ${currentOrder.food.name} (cold in ~${currentOrder.food.coldTime}s)`;
    restaurantEl.textContent = currentOrder.restaurant;
    distanceEl.textContent = `${currentOrder.neighborhood.distanceLabel} · ${currentOrder.neighborhood.name}`;
    distanceEl.className = `distance-${currentOrder.neighborhood.distance}`;
    customerEl.textContent = currentOrder.customerName;
    payEl.textContent = formatCurrency(currentOrder.payAmount);
    statusTextEl.textContent = "NEW ORDER — Decide now!";

    actionsEl.classList.remove("hidden");
    orderCard.classList.remove("hidden");
}

// ---- HIDE ORDER ----
function dismissOrder() {
    currentOrder = null;
    orderTimeLeft = 0;
    actionsEl.classList.add("hidden");
    orderCard.classList.add("hidden");
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
        totalTime: currentOrder.food.coldTime
    };

    // Fresh boost charge for this delivery
    state.boostActive = false;
    state.boostTimeLeft = 0;
    state.boostUsedThisDelivery = false;

    dismissOrder();

    deliveryFoodEl.textContent = `${state.currentDelivery.food.emoji} ${state.currentDelivery.food.name}`;
    deliveryPanel.classList.remove("hidden");
    updateDeliveryUI();
    statusTextEl.textContent = "Delivering...";
}

function handleDecline() {
    if (currentOrder) state.streakStats.ordersDeclined += 1;
    dismissOrder();
    statusTextEl.textContent = "Order declined. Waiting...";
}

function handleDeliver() {
    const d = state.currentDelivery;
    if (!d) return;

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

    // Apply position effects
    const cashMult = getActiveEffect("cashMultiplier");
    if (cashMult !== null) earned = Math.round(earned * cashMult);

    const ratingBonus = getActiveEffect("ratingPerDelivery");
    if (ratingBonus !== null && ratingDelta >= 0) ratingDelta += ratingBonus;

    const ratingLossReduction = getActiveEffect("ratingLossReduction");
    if (ratingLossReduction !== null && ratingDelta < 0) {
        ratingDelta = ratingDelta * (1 - ratingLossReduction);
    }

    // Apply to state
    state.cash += earned;
    state.rating = clamp(state.rating + ratingDelta, 0, 5);
    state.deliveriesThisShift += 1;
    state.streakStats.deliveries += 1;
    if (ratingDelta < 0) state.currentShiftWasPerfect = false;

    const ratingText = ratingDelta >= 0 ? `+${ratingDelta.toFixed(1)}` : ratingDelta.toFixed(1);
    statusTextEl.textContent = `${message} Earned $${earned}. Rating ${ratingText}`;

    updatePositions();

    // Clear delivery + boost
    state.currentDelivery = null;
    state.boostActive = false;
    state.boostTimeLeft = 0;
    state.boostUsedThisDelivery = false;
    deliveryPanel.classList.add("hidden");
    nextOrderIn = 3;
}

function handleBoost() {
    if (!state.currentDelivery) return;
    if (state.boostUsedThisDelivery) return;
    if (state.boostActive) return;

    state.boostActive = true;
    state.boostTimeLeft = BOOST_DURATION;
    state.boostUsedThisDelivery = true;
    updateBoostButton();
}

// ---- WIRE UP BUTTONS ----
acceptBtn.addEventListener("click", handleAccept);
declineBtn.addEventListener("click", handleDecline);
deliverBtn.addEventListener("click", handleDeliver);
boostBtn.addEventListener("click", handleBoost);

// ---- PER-FRAME UPDATE ----
export function updateOrderManager(deltaTime) {
    // ---- ACTIVE DELIVERY ----
    if (state.currentDelivery) {
        // Tick the boost timer (real seconds)
        if (state.boostActive) {
            state.boostTimeLeft -= deltaTime;
            if (state.boostTimeLeft <= 0) {
                state.boostActive = false;
                state.boostTimeLeft = 0;
            }
        }

        // Drain delivery timer — slower if boosting
        const drainRate = state.boostActive ? (1 / BOOST_SPEED) : 1.0;
        state.currentDelivery.timeLeft -= deltaTime * drainRate;

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

    // ---- IDLE — WAIT FOR NEXT ORDER ----
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
    state.boostActive = false;
    state.boostTimeLeft = 0;
    state.boostUsedThisDelivery = false;
    state.deliveriesThisShift = 0;
    actionsEl.classList.add("hidden");
    orderCard.classList.add("hidden");
    deliveryPanel.classList.add("hidden");
}