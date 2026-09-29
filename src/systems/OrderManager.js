import { state } from "../core/State.js";
import { randomInt, formatCurrency, clamp } from "../utils/math.js";
import { getRandomFood } from "../data/foods.js";
import { updatePositions, getActiveEffect } from "./PositionTracker.js";

// ---- DOM ELEMENTS ----
const orderCard     = document.getElementById("order-card");
const restaurantEl  = document.getElementById("order-restaurant");
const customerEl    = document.getElementById("order-customer");
const payEl         = document.getElementById("order-pay");
const foodEl        = document.getElementById("order-food");
const actionsEl     = document.getElementById("order-actions");
const acceptBtn     = document.getElementById("accept-btn");
const declineBtn    = document.getElementById("decline-btn");
const statusTextEl  = document.getElementById("game-status-text");

const deliveryPanel   = document.getElementById("delivery-panel");
const deliveryFoodEl  = document.getElementById("delivery-food");
const deliveryTimerEl = document.getElementById("delivery-timer");
const deliverBtn      = document.getElementById("deliver-btn");

// ---- ORDER STATE ----
let currentOrder = null;
let orderTimeLeft = 0;
let nextOrderIn = 3;
let lastFoodId = null;
const ORDER_DECISION_TIME = 6;

// ---- RANDOM DATA POOLS ----
const RESTAURANTS = [
    "Sushi Palace", "Burger Barn", "Taco Tornado", "Noodle House",
    "Pizza Prime", "Curry Corner", "Donut Diner", "Ramen Rush"
];

const NEIGHBORHOODS = [
    "Downtown", "Riverside", "Old Town", "Uptown",
    "Industrial District", "Hillside", "Seaside", "Campus Area"
];

// ---- GENERATE A RANDOM ORDER ----
function generateOrder() {
    const restaurant = RESTAURANTS[randomInt(0, RESTAURANTS.length - 1)];
    const neighborhood = NEIGHBORHOODS[randomInt(0, NEIGHBORHOODS.length - 1)];
    const customerName = `Customer #${randomInt(1000, 9999)}`;

    let food;
    do {
        food = getRandomFood();
    } while (food.id === lastFoodId);
    lastFoodId = food.id;

    const basePay = randomInt(5, 20);
    const payAmount = Math.round(basePay * food.payMultiplier);

    return { restaurant, neighborhood, customerName, food, payAmount };
}

// ---- SHOW A NEW ORDER ON SCREEN ----
function spawnOrder() {
    if (currentOrder !== null) return;
    if (state.currentDelivery !== null) return;

    currentOrder = generateOrder();
    orderTimeLeft = ORDER_DECISION_TIME;

    foodEl.textContent = `${currentOrder.food.emoji} ${currentOrder.food.name} (cold in ~${currentOrder.food.coldTime}s)`;
    restaurantEl.textContent = `${currentOrder.restaurant} (${currentOrder.neighborhood})`;
    customerEl.textContent = currentOrder.customerName;
    payEl.textContent = formatCurrency(currentOrder.payAmount);
    statusTextEl.textContent = "NEW ORDER — Decide now!";

    actionsEl.classList.remove("hidden");
    orderCard.classList.remove("hidden");
}

// ---- HIDE THE CURRENT ORDER ----
function dismissOrder() {
    currentOrder = null;
    orderTimeLeft = 0;
    actionsEl.classList.add("hidden");
    orderCard.classList.add("hidden");
}

// ---- UPDATE THE DELIVERY PANEL UI ----
function updateDeliveryUI() {
    const d = state.currentDelivery;
    if (!d) return;

    if (d.timeLeft > 0) {
        deliveryTimerEl.textContent = `${Math.ceil(d.timeLeft)}s`;
        deliveryTimerEl.classList.remove("cold");
    } else {
        deliveryTimerEl.textContent = `COLD · ${Math.ceil(-d.timeLeft)}s late`;
        deliveryTimerEl.classList.add("cold");
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

    dismissOrder();

    deliveryFoodEl.textContent = `${state.currentDelivery.food.emoji} ${state.currentDelivery.food.name}`;
    deliveryPanel.classList.remove("hidden");
    updateDeliveryUI();
    statusTextEl.textContent = "Delivering...";
}

function handleDecline() {
    if (currentOrder) {
        state.streakStats.ordersDeclined += 1;
    }
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

    // ---- APPLY POSITION EFFECTS ----
    const cashMult = getActiveEffect("cashMultiplier");
    if (cashMult !== null) earned = Math.round(earned * cashMult);

    const ratingBonus = getActiveEffect("ratingPerDelivery");
    if (ratingBonus !== null && ratingDelta >= 0) ratingDelta += ratingBonus;

    const ratingLossReduction = getActiveEffect("ratingLossReduction");
    if (ratingLossReduction !== null && ratingDelta < 0) {
        ratingDelta = ratingDelta * (1 - ratingLossReduction);
    }

    // ---- APPLY TO STATE ----
    state.cash += earned;
    state.rating = clamp(state.rating + ratingDelta, 0, 5);

    state.deliveriesThisShift += 1;
    state.streakStats.deliveries += 1;
    if (ratingDelta < 0) state.currentShiftWasPerfect = false;

    const ratingText = ratingDelta >= 0 ? `+${ratingDelta.toFixed(1)}` : ratingDelta.toFixed(1);
    statusTextEl.textContent = `${message} Earned $${earned}. Rating ${ratingText}`;

    // Check if any positions just qualified
    updatePositions();

    // Clear delivery
    state.currentDelivery = null;
    deliveryPanel.classList.add("hidden");
    nextOrderIn = 3;
}

// ---- WIRE UP BUTTONS ----
acceptBtn.addEventListener("click", handleAccept);
declineBtn.addEventListener("click", handleDecline);
deliverBtn.addEventListener("click", handleDeliver);

// ---- PER-FRAME UPDATE ----
export function updateOrderManager(deltaTime) {
    if (state.currentDelivery) {
        state.currentDelivery.timeLeft -= deltaTime;
        updateDeliveryUI();
        return;
    }

    if (currentOrder !== null) {
        orderTimeLeft -= deltaTime;
        statusTextEl.textContent = `NEW ORDER — ${Math.ceil(orderTimeLeft)}s`;
        if (orderTimeLeft <= 0) dismissOrder();
        return;
    }

    nextOrderIn -= deltaTime;
    if (nextOrderIn <= 0) {
        spawnOrder();
        nextOrderIn = randomInt(4, 8);
    }
}

// ---- RESET (called on restart) ----
export function resetOrderManager() {
    currentOrder = null;
    orderTimeLeft = 0;
    nextOrderIn = 3;
    state.currentDelivery = null;
    state.deliveriesThisShift = 0;
    actionsEl.classList.add("hidden");
    orderCard.classList.add("hidden");
    deliveryPanel.classList.add("hidden");
}