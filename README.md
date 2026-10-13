# Assets

Drop real files here when ready. The game runs fine with missing files —
sprite loads resolve to `null` and the code falls back to emoji.
Audio plays silently if files are missing.

## Folder Map

| Folder | Files |
|---|---|
| `sprites/characters/` | Player + NPC courier sprites |
| `sprites/customers/` | Customer archetype sprites |
| `sprites/hazards/` | Road hazards (dog, pothole, etc.) |
| `sprites/items/` | Food and gear icons |
| `sprites/ui/` | Star, battery, energy, cash icons |
| `sprites/logbook/` | Pixel art per deactivation reason |
| `sprites/backgrounds/` | Menu/map backgrounds |
| `audio/sfx/` | Short sound effects (.wav) |
| `audio/music/` | Looping tracks (.ogg) |

## Recommended Sources

- **Kenney.nl** — free CC0 sprites, tons of UI and character packs
- **itch.io** — search "free pixel art game assets"
- **OpenGameArt.org** — community assets, various licenses
- **AI tools**: Retro Diffusion, Makko, PixelVibe

## Sprite Size Guide

- Characters: 32×32 or 48×48
- Items: 16×16 or 24×24
- UI icons: 16×16
- Logbook pixel art: 64×64
- Backgrounds: 420×840 (matches game-container)

## Reference

All paths are registered in `src/assets.js`. Add new files there
first so the rest of the code can find them.