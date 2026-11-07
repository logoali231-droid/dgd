// Don't Get Deactivated! — Offline Service Worker
// Precaches all app assets and serves them when offline.
// Version: v1

const VERSION = 'v1';
const CACHE_NAME = `dgd-${VERSION}`;

// All project files (excluding node_modules/.git and the SW itself)
const APP_STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/main.js',
  '/styles/variables.css',
  '/styles/layout.css',
  '/styles/components.css',
  '/styles/animations.css',
  '/src/assets.js',
  '/src/core/GameLoop.js',
  '/src/core/Persistence.js',
  '/src/core/State.js',
  '/src/data/algorithmMessages.js',
  '/src/data/config.js',
  '/src/data/consumables.js',
  '/src/data/customerTypes.js',
  '/src/data/deathReasons.js',
  '/src/data/dialogueEvents.js',
  '/src/data/difficultyScaling.js',
  '/src/data/food.js',
  '/src/data/hazards.js',
  '/src/data/hiddenPositions.js',
  '/src/data/logbookEntries.js',
  '/src/data/neighborhoods.js',
  '/src/data/shiftPhases.js',
  '/src/data/upgrades.js',
  '/src/systems/AudioManager.js',
  '/src/systems/ConsumablesSystem.js',
  '/src/systems/DeactivationSystem.js',
  '/src/systems/DialogueSystem.js',
  '/src/systems/HazardSystem.js',
  '/src/systems/OrderManager.js',
  '/src/systems/PositionTracker.js',
  '/src/systems/Settings.js',
  '/src/systems/UpgradeSystem.js',
  '/src/ui/AlgorithmUI.js',
  '/src/ui/CareerHubUI.js',
  '/src/ui/ConfigUI.js',
  '/src/ui/HUD.js',
  '/src/ui/LogbookUI.js',
  '/src/ui/ScreenManager.js',
  '/src/ui/ShiftCompleteUI.js',
  '/src/ui/ShopUI.js',
  '/src/utils/math.js',
  '/src/utils/screenShake.js',
  '/assets/audio/music/music_lofi_calm.ogg',
  '/assets/audio/sfx/sfx_order_ding.wav',
  '/assets/sprites/characters/player_bike_idle.png',
  '/assets/sprites/characters/player_bike_pedaling.png',
  '/assets/sprites/items/item_coffee_cup.png',
  '/assets/sprites/items/item_pizza_box.png',
];

// ─── Install event: precache all static assets ───
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Use addAll; if any file fails, the whole install fails.
      // For robustness, log failures but don't block install.
      await Promise.allSettled(
        APP_STATIC_RESOURCES.map(async (url) => {
          try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            await cache.put(url, response);
          } catch (err) {
            console.warn(`[SW] Failed to cache ${url}: ${err.message}`);
          }
        })
      );
    })()
  );
});

// ─── Activate event: clean up old caches ───
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
          return undefined;
        })
      );
      // Take control of all open pages immediately
      await clients.claim();
    })()
  );
});

// ─── Fetch event: serve from cache, with special handling ───
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = request.url;

  // 1. Navigation requests → serve cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match('/index.html');
        if (cached) {
          return cached;
        }
        // Fallback: fetch from network (if online) and cache it
        try {
          const response = await fetch('/index.html');
          if (response.ok) {
            cache.put('/index.html', response.clone());
          }
          return response;
        } catch {
          return new Response('<h1>Don\'t Get Deactivated!</h1><p>Offline. Please connect to the internet.</p>', {
            status: 503,
            headers: { 'Content-Type': 'text/html' },
          });
        }
      })()
    );
    return;
  }

  // 2. API requests to /api/state → serve seeded fallback when offline
  if (url.includes('/api/state') || url.includes('State.js')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(url);
        if (cached) {
          return cached;
        }
        // Seeded default state for offline play
        return new Response(
          JSON.stringify({
            isPlaying: false,
            rating: 5,
            energy: 100,
            battery: 100,
            cash: 0,
            shiftTimeRemaining: 43200,
            currentPhase: null,
            setting: { soundOn: true, vibrationOn: true },
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      })()
    );
    return;
  }

  // 3. Static assets → cache-first strategy
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(request.url);
      if (cachedResponse) {
        // Return cached version immediately
        return cachedResponse;
      }
      // Not cached: fetch from network, if online and then cache it
      try {
        const response = await fetch(request);
        if (response.ok) {
          // Clone the response since it's a stream; cache the clone
          cache.put(request.url, response.clone());
        }
        return response;
      } catch (err) {
        console.warn(`[SW] Network failed for ${request.url}: ${err.message}`);
        return new Response(null, { status: 404 });
      }
    })()
  );
});

