# Gear Shop & Inventory — tabbed menu

Date: 2026-06-12
Status: approved (build)

## Goal
Convert the single-screen main menu into a **tabbed shell** with a bottom tab bar:
**Battle** (current world-select + PLAY), **Shop**, **Inventory**. Add a gear system
where players buy equipment with gold, equip it in typed slots, and see it rendered
on their character both in the menu and in-game.

## 1. Menu shell
- `#menu` keeps the shared top currency pills (`#menutop`). Its body becomes three
  panels (`#tab-battle`, `#tab-shop`, `#tab-inventory`) toggled by a bottom tab bar
  (`#tabbar`) with three buttons. Active tab highlighted; one panel visible at a time.
- **Battle** panel holds the existing `#charwrap`, `#worldsel`, and PLAY button — no
  gameplay-entry changes.
- Style matches existing cream-panel / brown-outline (`#3a2d22`) look. No reference-art copy.

## 2. Categories & slots
Four typed equip slots, one item each: **helmet, chest, pants, shoes**.
Equipping an item fills its category slot, replacing any current piece.

## 3. Rarities, stats, catalog
- Five rarities reuse card colors: common, uncommon, rare, epic, legendary.
- Each item gives a **starting-damage %** bonus only (extensible later). Bonuses from
  the (up to 4) equipped pieces **sum**.
- Catalog = 4 categories × 5 rarities = **20 items**. Item id = `<cat>_<rarity>`
  (e.g. `helmet_rare`). Each has a display name.

| Rarity | Dmg bonus | Price (gold) |
|---|---|---|
| common | +6% | 80 |
| uncommon | +12% | 250 |
| rare | +20% | 700 |
| epic | +32% | 1800 |
| legendary | +50% | 4000 |

`equippedDmgMult()` = `1 + sum(bonus of each equipped item)`. Full legendary → ×3.

## 4. Art (4 silhouettes recolored by rarity)
- Add 4 gear silhouette sprites to `sprites.js`: `gear_helmet`, `gear_chest`,
  `gear_pants`, `gear_shoes`, drawn in the 128px player canvas space aligned to the
  player body (head/torso/legs/feet).
- Per-item appearance = category silhouette **tinted by rarity color** via the existing
  `tintedSprite(name, tint)` path. (Unique per-item art is a future additive task.)

## 5. Gear on the character
- **In-game:** in the player draw block (game.js ~1449), after `drawSprite('player',…)`,
  draw each equipped piece with `drawSprite('gear_<cat>', P.x, P.y, P.r*2.6, bob, 0, 0,
  flip, rarityColor)` so it layers at the same transform (respects bob/flip/blink).
- **Menu:** recomposite player + equipped gear onto an offscreen canvas and set
  `#charimg.src = composite.toDataURL()` whenever equipment changes (`refreshMenuChar()`).

## 6. Daily shop (same for everyone)
- Shop shows **4 items/day**, chosen **deterministically from the UTC date**: seed =
  hash of `YYYY-MM-DD` (UTC) → stable shuffle of the 20-item catalog → take first 4.
  Everyone on the same calendar day sees the same 4. Rotates at UTC midnight.
- Buying deducts gold, marks item permanently **owned**; owned items still render in the
  rotation but show "Owned" (not re-buyable). Disabled when gold < price.

## 7. Persistence (localStorage)
- `br_items_owned` — JSON array of owned item ids.
- `br_gear_equipped` — JSON `{helmet,chest,pants,shoes}` of equipped ids (or null).
- Daily shop is derived from the date (optionally cached as `br_shop_day`).

## 8. Files touched
- `js/shop.js` (new) — catalog, rarity table, owned/equipped state + persistence,
  date-seeded daily pick, `equippedDmgMult()`, tab switching, shop + inventory render,
  `refreshMenuChar()`. Loaded after `game.js`.
- `js/sprites.js` — 4 gear silhouettes.
- `index.html` — restructure `#menu` into tabs + tab bar; add `shop.js` script tag.
- `styles.css` — tab bar, shop grid, inventory slots/cards.
- `js/game.js` — `startGame()` applies `P.dmg *= equippedDmgMult()` after `resetPlayer()`;
  player draw block draws equipped gear overlays; call `refreshMenuChar()` at init.

## 9. Verify
Headless Edge per usual flow: menu tabs switch; buy deducts gold + persists; equip fills
slot + updates menu char; entering a world applies the damage multiplier; gear renders on
the in-game survivor; daily pick is stable for a fixed date. Throwaway harness for the
date-seed + `equippedDmgMult()` math; delete before done.
