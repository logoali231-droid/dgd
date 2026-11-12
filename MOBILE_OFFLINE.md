# Playing DGD on a phone, offline

This document covers how the game was made runnable on a phone with no
localhost server and no internet connection, what was verified, and how to
get it onto your device.

---

## 1. Which route was taken, and why

**Route: a single self-contained HTML file** — `dist/dont-get-deactivated.html`.

### The feasibility check

The project is vanilla JavaScript with ES modules and no build step. That is
fine on a desktop served over `http://`, but it cannot run from phone storage,
because browsers refuse to load ES modules over `file://`.

This was confirmed empirically, not assumed. Opening the unmodified
`index.html` from `file://` in Chromium produced:

```
Access to script at 'file:///…/main.js' from origin 'null' has been blocked
by CORS policy: Cross origin requests are only supported for protocol
schemes: chrome, chrome-untrusted, data, http, https.
```

The page rendered its static HTML, but `window.state` was `undefined` — the
game never booted. That is the single hard blocker.

Everything else was already compatible:

| Check | Result |
|---|---|
| `fetch()` / `XMLHttpRequest` / dynamic `import()` | **none** — no runtime network calls |
| Asset loading | `new Image()` with emoji fallback; missing files fail silently |
| Audio | `new Audio()` with `.catch()`; missing files fail silently |
| Save data | `localStorage` — **works on `file://`** (verified) |
| External dependency | one Google Fonts `<link>` (now removed) |
| Module graph | 1 cycle (`OrderManager` ↔ `HazardSystem`), harmless when bundled |

So the fix was narrow: **flatten the module graph into one classic script and
inline every stylesheet and the font.** No game logic had to change.

### Why not the hosted / service-worker route

A PWA with a service worker would also work, but it requires the user to
visit a hosted URL once, and it only caches after that first online visit.
The single-file build is strictly better for the stated goal: copy one file to
the phone, open it, play — no server, no first visit, no cache to warm up.

The PWA metadata (`manifest.webmanifest`, theme colour, apple-touch-icon) is
still in `index.html` so the game can *also* be installed from a hosted URL
later, but the offline guarantee comes from the single file.

---

## 2. What was verified

All tests ran in headless Chromium with a **simulated iPhone**
(390×844 viewport, `device_scale_factor: 3`, `is_mobile: true`,
`has_touch: true`, iOS user agent), loading the build from `file://` with
**all non-`file:`/`data:` network requests aborted** — i.e. genuinely offline.

| Check | Result |
|---|---|
| Boots from `file://` with network blocked | ✅ `window.state` is an object |
| Pixel font renders | ✅ `document.fonts.check('12px "Press Start 2P"')` → true |
| `localStorage` read/write | ✅ works, save key `dgd_save_v1` persists |
| Start shift (touch tap) | ✅ `isPlaying: true` |
| Order card appears → accept | ✅ |
| Ride scene + hold-to-pedal (touch pointer events) | ✅ ride completed |
| Arrival mini-game opens → action chosen | ✅ |
| Delivery resolves | ✅ `deliveries: 1`, cash earned, `lastDelivery` set |
| End Shift Early (two-tap confirm) | ✅ `screen-deactivated`, reason `quit_early_menu` |
| Console / page errors | ✅ **none** |

Landscape was tested separately (844×390 viewport, touch), because a phone
held sideways has very little vertical room. It exposed a **real pre-existing
bug**: there was no global `.hidden` rule, only per-element ones, and
`#order-card` (213 px) plus `#order-actions` (44 px) had none — so they stayed
in the layout during a ride and pushed the pedal **below the fold** (pedal top
at 690 px in a 390 px viewport). After the fixes below the pedal sits at
**279–323 px**, fully on screen, with no scrolling:

| Check (landscape 844×390) | Result |
|---|---|
| Container switches to two-column | ✅ `flex-direction: row` |
| Pedal reachable without scrolling | ✅ top 279, bottom 323, visible |
| Ride canvas capped | ✅ 86 px (`max-height: 22vh`) |
| Console / page errors | ✅ none |

A separate regression run served the *unmodified* multi-file project over
`http://localhost` and re-ran the original QA script: full loop, delivery,
End Shift Early and save/load all still pass with **zero errors**. The
existing playable loop is intact.

Screenshots from the mobile run are in `qa/shots/offline-*.png`.

---

## 2b. Bugs found and fixed along the way

Both of these were pre-existing and affected **every** device, not just
phones — landscape testing is simply what surfaced them.

1. **No global `.hidden` utility.** `#order-card` and `#order-actions` are
   toggled with `classList.add('hidden')`, but neither had a matching CSS
   rule, so they never actually disappeared. On desktop the tall window hid
   the problem; on a short viewport it put the pedal off-screen. Added a
   single `.hidden { display: none !important; }` rule in
   `styles/utilities.css`.
2. **Landscape layout overflowed.** A 420 px column in a 390 px-tall
   viewport left no room for the play area. Reworked the landscape block in
   `mobile.css`: HUD becomes a left-hand column, the duplicate status line is
   hidden, and the ride canvas, bars and buttons are all capped so the whole
   delivery panel fits. The hazard banner is now an overlay instead of an
   extra row.

No game logic changed for either fix — CSS only.

---

## 3. Getting it onto your phone

### Option A — the single file (recommended, fully offline)

1. Get `dist/dont-get-deactivated.html` onto the phone:
   - **Android:** download it, or copy it over USB into `Download/`.
   - **iPhone:** AirDrop it, or save it to the Files app (e.g. via iCloud
     Drive or a download in Safari → *Downloads*).
2. Open the file with a browser:
   - **Android:** tap the file in Files/Downloads → *Open with* → Chrome.
   - **iPhone:** open the Files app → tap the file. If it previews instead of
     running, use *Share → Open in Safari*, or put the file in iCloud Drive
     and open it from Safari's address bar via `file://`.
3. Play. No internet needed — the file contains the code, styles and font.

Progress (cash, upgrades, logbook, settings) is saved in the browser's
`localStorage` for that file. It survives closing the tab, but it is tied to
that browser and that file location — moving the file to a new path or
clearing site data resets it.

> **Note on iOS:** Safari is stricter about `file://` than Chrome. If a
> direct open shows a preview rather than the game, the reliable path is
> Option B (host it once, then *Add to Home Screen*).

### Option B — host it once, then install (best on iPhone)

1. Put the repo (or just `index.html`, `main.js`, `src/`, `styles/`,
   `assets/`) on any static host — GitHub Pages, Netlify, Cloudflare Pages.
2. Open the URL on the phone.
3. **iPhone:** Share → *Add to Home Screen*. **Android:** menu → *Install app*.
4. It launches full-screen from the home screen. The service worker is not
   required for this to work; the app shell is small and the game makes no
   network calls after load.

### Rebuilding the single file

After changing any game code:

```bash
npm install          # once — installs esbuild
node build/build.mjs # writes dist/dont-get-deactivated.html
```

The script fails loudly if any external reference survives inlining. CI
(`.github/workflows/build.yml`) also rebuilds and commits `dist/` on every
source change, so the downloadable file always matches the code.

---

## 4. What changed

| File | Change |
|---|---|
| `build/build.mjs` | **new** — esbuild bundler: flattens all modules into one IIFE, inlines the five stylesheets (minified) and the font as a data URI, strips the external `<link>`/`<script>` tags, writes `dist/dont-get-deactivated.html`. Warns if any external reference remains. |
| `dist/dont-get-deactivated.html` | **new** — the built game, ~115 KB, zero external references. This is the file you put on the phone. Rebuilt automatically by CI. |
| `styles/mobile.css` | **new** — device-aware layer: `100dvh` + safe-area insets, 44 px minimum touch targets, `touch-action` tuning (the pedal uses `none` so a long press is never eaten by scrolling), larger minimum font sizes on small screens, a **two-column landscape layout** that fits a 390 px-tall viewport, tablet/desktop framing, `prefers-reduced-motion` support, and `:focus-visible` outlines. |
| `styles/utilities.css` | **new** — the global `.hidden { display: none !important; }` utility (see §2b). |
| `assets/fonts/pressstart2p-latin.woff2` | **new** — self-hosted Latin subset of the pixel font (12.5 KB), so no Google Fonts request is needed. |
| `styles/variables.css` | added the `@font-face` pointing at the local font. |
| `index.html` | removed the Google Fonts `<link>`; added `viewport-fit=cover`, `user-scalable=no`, theme colour, apple/mobile web-app meta, manifest and icon links; linked `utilities.css` and `mobile.css`. |
| `.github/workflows/build.yml` | **new** — rebuilds `dist/` on every source change, uploads it as a workflow artifact, and commits the result. Fixed a first-run bug where `git diff --quiet` skipped the commit for a not-yet-tracked file. |
| `package.json` / `package-lock.json` | **new** — dev dependency on `esbuild` only. The game itself still has **zero runtime dependencies**. |
| `.gitignore` | **new** — ignores `node_modules/` and the scratch font downloads in `build/`. |

### What did *not* change

No game logic, no data files, no systems, no UI modules. The ride scene,
arrival mini-game, End Shift Early, hazards, upgrades and save/load are
byte-identical to the previous commit — the mobile work is a build step plus
a CSS layer (the only CSS-side behaviour fix is the missing `.hidden` rule,
which restores what the JS already intended).

### Known limitation

`assets/sprites/` and `assets/audio/` contain only README placeholders in the
repo, so the game runs on its emoji fallbacks. That is pre-existing, not
introduced here; when real sprites are added, `build.mjs` will need a small
extension to inline them as data URIs (the current build inlines CSS and the
font only).
