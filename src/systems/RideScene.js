/**
 * RideScene — a live, top-down-ish view of the ride.
 *
 * This is the "navigation phase" from the design doc, rendered on a canvas
 * so it stays cheap: a scrolling road, a courier, and hazards that rush
 * toward you. It is purely presentational — the actual hazard timing and
 * penalties still live in HazardSystem, which asks this module which hazard
 * is currently incoming so the two stay in sync.
 *
 * The scene never blocks input: the pedal button sits below it.
 */

import { state } from '../core/State.js';
import { getSprite, ASSETS } from '../assets.js';

const W = 360;   // logical width
const H = 200;   // logical height

let canvas = null;
let ctx = null;
let dpr = 1;

// ---- Scroll / animation state ----
let roadOffset = 0;
let skylineOffset = 0;
let bob = 0;
let running = false;
let lastPhaseColor = "#ffcc00";

// ---- Incoming hazard (mirrors HazardSystem) ----
let incoming = null; // { emoji, name, t, window }

// ---- Roadside props ----
const PROPS = ["🌳", "🏢", "🏠", "🚏", "💡", "🏪"];
let props = [];

function seedProps() {
    props = [];
    for (let i = 0; i < 6; i++) {
        props.push({
            side: i % 2 === 0 ? -1 : 1,
            y: (i / 6) * H,
            emoji: PROPS[Math.floor(Math.random() * PROPS.length)],
        });
    }
}

export function initRideScene() {
    canvas = document.getElementById("ride-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", resize);
    seedProps();
}

function resize() {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = "100%";
    canvas.style.aspectRatio = `${W} / ${H}`;
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function startRide() {
    running = true;
    roadOffset = 0;
    skylineOffset = 0;
    bob = 0;
    incoming = null;
    seedProps();
}

export function stopRide() {
    running = false;
    incoming = null;
    if (ctx) ctx.clearRect(0, 0, W, H);
}

/**
 * HazardSystem calls this when it spawns a hazard so the canvas can show
 * the same obstacle rushing toward the courier.
 */
export function setIncomingHazard(hazard) {
    if (!hazard) {
        incoming = null;
        return;
    }
    incoming = { emoji: hazard.emoji, name: hazard.name, t: 0, window: hazard.reactionWindow };
}

export function clearIncomingHazard() {
    incoming = null;
}

/**
 * Advance the scene. `speed` is 0..1 (how hard you're pedaling).
 */
export function updateRide(deltaTime, speed = 0) {
    if (!running || !ctx) return;

    const boost = state.boostActive ? 1.8 : 1;
    const scroll = (40 + speed * 220) * boost * deltaTime;

    roadOffset = (roadOffset + scroll) % 40;
    skylineOffset = (skylineOffset + scroll * 0.25) % W;
    bob += deltaTime * (6 + speed * 10);

    // Props drift down the screen
    for (const p of props) {
        p.y += scroll * 0.9;
        if (p.y > H + 20) {
            p.y = -20;
            p.emoji = PROPS[Math.floor(Math.random() * PROPS.length)];
        }
    }

    // Incoming hazard closes in
    if (incoming) {
        incoming.t += deltaTime;
        if (incoming.t > incoming.window + 0.6) incoming = null;
    }

    draw(speed);
}

function draw(speed) {
    const phase = state.currentPhase;
    if (phase) lastPhaseColor = phase.color;

    // ---- Sky / backdrop ----
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#0a0a12");
    grad.addColorStop(0.45, "#14141f");
    grad.addColorStop(1, "#1c1c26");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // ---- Distant skyline (parallax) ----
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    for (let i = 0; i < 14; i++) {
        const bx = ((i * 34) - skylineOffset + W) % (W + 40) - 20;
        const bh = 30 + ((i * 37) % 45);
        ctx.fillRect(bx, H * 0.42 - bh, 22, bh);
    }

    // ---- Road ----
    const roadTop = H * 0.42;
    ctx.fillStyle = "#101018";
    ctx.fillRect(0, roadTop, W, H - roadTop);

    // Road edges
    ctx.fillStyle = "#2a2a38";
    ctx.fillRect(0, roadTop, W, 3);
    ctx.fillRect(0, H - 3, W, 3);

    // Dashed centre line, scrolling
    ctx.fillStyle = "rgba(255,204,0,0.55)";
    for (let y = roadTop + roadOffset; y < H; y += 40) {
        ctx.fillRect(W / 2 - 2, y, 4, 18);
    }

    // ---- Roadside props ----
    ctx.font = "16px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const p of props) {
        const x = p.side < 0 ? 22 : W - 22;
        ctx.globalAlpha = 0.85;
        ctx.fillText(p.emoji, x, p.y);
        ctx.globalAlpha = 1;
    }

    // ---- Incoming hazard ----
    if (incoming) {
        const p = Math.min(incoming.t / incoming.window, 1.2);
        const hy = roadTop + 10 + p * (H - roadTop - 60);
        const size = 18 + p * 22;
        ctx.font = `${size}px serif`;
        ctx.fillText(incoming.emoji, W / 2, hy);

        // Warning ring
        ctx.strokeStyle = `rgba(255,68,68,${0.8 - p * 0.4})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(W / 2, hy, size * 0.9, 0, Math.PI * 2);
        ctx.stroke();
    }

    // ---- Courier ----
    const cx = W / 2;
    const cy = H - 34 + Math.sin(bob) * (speed > 0.05 ? 2.5 : 0.6);
    const sprite = getSprite(ASSETS.sprites.characters.player_bike_pedaling);
    if (sprite) {
        const sw = 40, sh = 40;
        ctx.drawImage(sprite, cx - sw / 2, cy - sh / 2, sw, sh);
    } else {
        ctx.font = "30px serif";
        ctx.fillText("🚴", cx, cy);
    }

    // Speed lines when pedaling hard
    if (speed > 0.4) {
        ctx.strokeStyle = `rgba(57,255,20,${(speed - 0.4) * 0.6})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            const lx = 40 + i * 70;
            const ly = roadTop + 20 + ((i * 53 + roadOffset * 3) % (H - roadTop - 40));
            ctx.beginPath();
            ctx.moveTo(lx, ly);
            ctx.lineTo(lx, ly + 16);
            ctx.stroke();
        }
    }

    // ---- Distance marker ----
    const d = state.currentDelivery;
    if (d) {
        const pct = Math.min(d.progress / d.distance, 1);
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(8, 8, W - 16, 16);
        ctx.fillStyle = lastPhaseColor;
        ctx.fillRect(10, 10, (W - 20) * pct, 12);
        ctx.fillStyle = "#fff";
        ctx.font = "9px monospace";
        ctx.textAlign = "left";
        ctx.fillText(`${Math.round(pct * 100)}%`, 14, 17);
        ctx.textAlign = "right";
        ctx.fillText(d.neighborhood ? d.neighborhood.name : "", W - 14, 17);
        ctx.textAlign = "center";
    }
}
