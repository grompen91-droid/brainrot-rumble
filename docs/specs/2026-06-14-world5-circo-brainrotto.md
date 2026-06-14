# World 5 — CIRCO BRAINROTTO

Date: 2026-06-14
Status: built (PR)

Fifth bespoke world, replacing the `FROSTBITE` placeholder at `WORLDS[4]`. Big-top **carnival**
theme (striped red/gold palette) — a deliberate contrast with the frozen World 4. **Band 3**: a
difficulty step up (tankier foes) that introduces the first **bounce/teleport** gimmicks to begin
bridging toward the bullet-hell worlds at W7+. Bosses stay telegraphed and fair.

## IP note
Research finding: the OG Italian Brainrot canon is **thin on circus characters** — only
**Burbaloni Dogolini** (a living balloon-dog/lollipop) is a clear fit. Per the user's decision, the
rest of the cast is **house-built carnival hybrids** in the genre's style (absurd hybrid + rhyming
`-ino/-ina` names), anchored by that one canon character. This trades strict IP-canon adherence
(PLAN.md §11) for a cohesive theme, with the owner's sign-off.

## World data (`WORLDS[4]`)
- `id:'circo'`, name `CIRCO BRAINROTTO`, **band 3**, 20 waves, map **3200×2600** (wide midway).
- Carnival theme (cream/red tent stripes, `tint #ffcf6b`), no enemy tint (dedicated sprites).

## Enemies — `FOES_W5` (8)
| Tier | spr | Name | Role | Source |
|------|-----|------|------|--------|
| I | burbalonidog | Burbaloni Dogolini | floaty fodder, pops into 3 bullets on death | **canon** |
| I | popcorrino | Popcorrino Bucketto | fodder, splits on death | house |
| I | zuccherofilino | Zucchero Filino | fast weaving fodder | house |
| II | clownino | Clownino Honkhonk | dasher (lunge) | house |
| II | cannonino | Cannonino Umano | human-cannonball dash + knockback | house |
| III | giocoliere | Giocoliere Scimmino | caster, lobs 3 arcing balls | house |
| IV | forzutoorsino | Forzuto Orsino | armored heavy: slam zone + 5-bullet death ring | house |
| V | maestrofoccino | Maestro Foccino | support (heals nearby) + whistle shot | house |

## Bosses — `BOSSES_W5` (4), original movesets
- **W5 · Trapezino Volantino** (acrobat): `TRAPEZE_SWING` (dash), `RING_TOSS`, `HOOP_RING`.
- **W10 · Giostra Vorticosa** (living carousel): `CAROUSEL_SPIN` (sweep), `HORSE_CHARGE` (kb dash), `CALLIOPE_ZONE`.
- **W15 · Mangiafuoco Draghino** (fire-eater): `FIRE_BREATH` (cone), `FIRE_JUGGLE` (**bouncing fireballs**, reuses the `wd` wall-bounce charge), `EMBER_RING`.
- **W20 · Il Gran Pagliaccio** (the Great Ringmaster, headliner): `SUMMON_ACT` (clown adds), `BALLOON_RING` (double ring), `BLINK` (**teleport**, reuses `warpT`), `CONFETTI_SPIRAL`.

## Ability cards (gated `minWorld:4`)
- **Lucky Spin** (passive, uncommon, ×5): +6%/lvl chance for a JACKPOT hit (double damage).
- **Bouncy Shot** (ability → **Pinball Wizard**): shots ricochet off the arena walls, re-arming to
  hit again each bounce; evolve adds many bounces + bigger shots.
- **Showstopper** (synergy, req `luckyspin`+`crit`): JACKPOT hits also critically strike.

Wiring: jackpot in `damageEnemy`; `bounce` field on player bullets reflected off `WALL` bounds in
the bullet-update loop (clears the hit-set per bounce for pinball re-hits); new defaults in
`resetPlayer`.

## Verification
- `node --check` on all JS files.
- Headless sprite-build harness (stubbed canvas, Node `vm`): all 158 sprites build, incl. the 12
  new ones, no runtime errors.
- Visual: Edge-headless screenshot of all 12 sprites (recognizable, on-theme, in-bounds).
- End-to-end: loaded the real `index.html` in Edge headless — menu builds, no console errors.
