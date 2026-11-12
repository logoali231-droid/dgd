# Don't Get Deactivated!

> *"You're not an employee. You're a line item."*

A gig-economy rogue-lite survival game where you play as a delivery courier racing against a cold-food timer, hostile traffic, and a mysterious Algorithm that monitors your every move — and is always ready to deactivate you for reasons that range from the mundane ("soup was warm, not piping hot") to the absurd ("you paused to pet a cat").

---

## 🙏 A Tribute to *Don't Get Fired!*

**Don't Get Deactivated! is an independent game inspired by [_Don't Get Fired!_](https://play.google.com/store/apps/details?id=com.quickturtle.EmployeeSurvival_en) by QuickTurtle.**

The original game inspired us to explore a related question: what happens when the absurdity of workplace survival moves from the corporate office to the gig economy?

In *Don't Get Deactivated!*, you play as a delivery courier struggling against arbitrary ratings, unreasonable customers, dangerous streets, and an Algorithm that treats people as disposable metrics.

While the original explores corporate career survival, this project approaches the theme through delivery gameplay, pedal-based movement, stamina management, road hazards, food-temperature deadlines, and persistent progression between shifts.

### What this project aims to do

- Explore related themes of precarious work, arbitrary evaluations, and dark corporate humor.
- Develop its own gameplay systems, code, dialogue, and narrative.
- Build an independent identity through original art, audio, and future content.

This project is a work in progress. Placeholder visuals and other unfinished elements may still be present.

### Support the original

If you enjoy this project's inspiration, check out the original game by QuickTurtle:

- [Play *Don't Get Fired!* on Google Play](https://play.google.com/store/apps/details?id=com.quickturtle.EmployeeSurvival_en)
- [Find *Don't Get Fired!* on the App Store](https://apps.apple.com/us/app/dont-get-fired/id1008957297)

The original deserves recognition for inspiring this project. Please support its creators!

---

## 📱 Play on a phone, offline

You don't need Node, a localhost server, or an internet connection to play.

**One file does it all:** [`dist/dont-get-deactivated.html`](dist/dont-get-deactivated.html)
(~115 KB) contains every script, stylesheet and the font inlined. Copy it to
your phone and open it — no server needed.

**Android:** copy the file to `Download/`, then open it in Chrome.
**iPhone:** AirDrop it or save it to the Files app, then open it — or use the
hosted route below if Safari previews instead of running it.

The game also carries PWA metadata, so you can host the repo on any static
host and **Add to Home Screen** for a full-screen, offline-capable install.

Rebuild the single file after changing the game:

```bash
npm install
node build/build.mjs
```

Full details — what blocked mobile play, what was verified, and phone
step-by-steps — are in **[MOBILE_OFFLINE.md](MOBILE_OFFLINE.md)**.

---

## 🎮 The Game

You are a courier for an unnamed delivery platform. Your shift lasts 12 in-game hours. You accept orders, hold a pedal to ride to the customer, release to brake for hazards, boost when things get tight, and try to survive until the clock runs out.

**Every run ends one of two ways:**
1. **You complete the shift** — earning cash, saved tips, and (if you're lucky) a hidden position that buffs your next run.
2. **You get deactivated** — the Algorithm flags you for something, and a new entry goes in your Deactivation Logbook. Every death teaches you something, and every repeat death increases your survival chance against that specific reason.

### Core Loop

```
ORDER QUEUE → ACCEPT/DECLINE → RIDE (hold pedal, dodge hazards)
     → ARRIVAL (knock / call / text / leave at door)
     → RATING + TIP → next order …
     → SHIFT END (survive) or DEACTIVATION (logbook entry)
```

1. **Order queue** — an order card appears with the food, the customer
   archetype, the neighborhood, and the pay. You have a few seconds to
   accept or decline (the window shrinks as the Algorithm gets stricter).
2. **Ride** — hold the pedal to fill the progress bar. Release to brake for
   hazards (potholes, car doors, stray dogs, red lights). Endurance drains
   while you pedal and recovers while you coast. Boost once per delivery.
3. **Arrival** — at the door you choose *how* to hand the food over. Every
   option is a trade-off: knocking is safe but slow, calling costs battery,
   texting is slow, leaving at the door is instant but can be stolen.
4. **Rating & tip** — on-time deliveries pay full; cold food pays less and
   costs rating. Customer archetypes and your arrival choice both move the
   needle.
5. **Shift end** — survive all 12 in-game hours for cash, saved tips, and a
   chance at a hidden position. Or get deactivated and log the reason.

### Systems

| System | File | Responsibility |
|--------|------|----------------|
| Game loop | `src/core/GameLoop.js` | Delta-time tick, phase music, drain, end-of-shift |
| State | `src/core/State.js` | Single source of truth + save/load |
| Orders | `src/systems/OrderManager.js` | Spawn, accept/decline, pedal, delivery resolution |
| Ride scene | `src/systems/RideScene.js` | Canvas navigation view (road, courier, hazards) |
| Arrival | `src/systems/ArrivalSystem.js` | The door mini-game |
| Hazards | `src/systems/HazardSystem.js` | Hazard spawns, red lights, brake-to-dodge |
| Deactivation | `src/systems/DeactivationSystem.js` | Condition rolls + the Algorithm's penalty events |
| Positions | `src/systems/PositionTracker.js` | Hidden-position unlocks and their effects |
| Upgrades | `src/systems/UpgradeSystem.js` | Meta-progression purchases and their effects |
| Audio | `src/systems/AudioManager.js` | SFX + phase-driven music |

### The Algorithm's penalty events

The Algorithm no longer kills you at random. Instead it fires **penalty
events** on a timer (an audit, a surge temptation, a complaint wave, an app
update, a stray dog…). Each event chips at your energy, battery, cash, or
rating — and only *finishes you off* when it catches you already on the
floor. Survive the hit and you keep riding.

### Deactivation conditions

Stat lines (rating 0, energy 0, battery 0, cold food, three red lights) are
rolled **once per close call**, not every frame, and each reason you survive
goes on a short cooldown. Every death to a reason permanently raises your
survival chance against it — the Logbook is your progress bar.

### Running it

No build step. It is plain ES modules, so serve the folder over HTTP:

```bash
python3 -m http.server 8099
# then open http://localhost:8099/index.html
```

(Opening `index.html` directly from the filesystem will not work — ES module
imports need an HTTP origin. For phone/offline play, use the single-file
build in `dist/` instead, which needs no server at all.)

### Assets

`assets/sprites/` and `assets/audio/` are intentionally empty placeholders.
Every sprite and sound is declared in `src/assets.js` and every consumer
falls back gracefully (emoji for sprites, silence for audio), so the game is
fully playable before any art lands. Drop real files in and they light up.
