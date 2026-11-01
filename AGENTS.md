# Bitburner quack corporation scripts —Maintenance log

## Project layout

- `bitburner/src/` — the player's scripts (the "quack" framework by Duck McSouls).
- `bitburner-src/markdown/` — auto-generated API docs for Bitburner (reference).
- The game's working directory inside scripts is `/quack/...` (matches `bitburner/src/...`).

## Corporation API migration (Bitburner 3.0.0+)

The original `quack` corporation code targeted an older Bitburner API. Many
`ns.corporation.*` functions were renamed or removed in 3.0.0. The following
helper changes were applied to make the code work on the current API.

### `lib/corporation/corp.js` (Corporation helper class)

| Old API call                              | New API call                                   | Notes |
|-------------------------------------------|------------------------------------------------|-------|
| `hasUnlockUpgrade(name)`                  | `hasUnlock(name)`                              | |
| `unlockUpgrade(name)`                     | `purchaseUnlock(name)`                        | |
| `getUnlockUpgradeCost(name)`             | `getUnlockCost(name)`                          | |
| `getPurchaseWarehouseCost()`              | `getConstants().warehouseInitialCost`          | |
| `getEmployee(div, ct, name)`              | **removed**                                    | `avg_employee_stats` rewritten to use `Office.avgMorale` / `avgEnergy` |
| `assignJob(div, ct, name, role)`          | `setJobAssignment(div, ct, role, amount)`      | `hireEmployee(div, ct, role?)` now returns boolean and accepts an optional initial position; no more per-employee `assignJob` |
| `hireEmployee(div, ct)` -> employee obj   | `hireEmployee(div, ct, role?)` -> boolean      | |
| `getOffice(div, ct).employees` (array)    | `getOffice(div, ct).numEmployees` (number)     | `Office` no longer exposes per-employee arrays |
| `getCorporation().divisions` (objects)    | `getCorporation().divisions` (string[])         | `has_division_office` rewritten to use `getDivision(div).cities.includes(ct)` |
| `getMaterial(div, ct, name).qty`          | `getMaterial(div, ct, name).stored`           | |
| `getDivision(div).research`               | `getDivision(div).researchPoints`              | |
| `getProduct(div, name)`                   | `getProduct(div, ct, name)`                    | `has_product`/`is_product_complete`/`product_rating` now derive `ct` from `getDivision(div).cities[0]` |
| `getProduct(div, name).rat`               | `getProduct(div, ct, name).rating`             | |
| `getCorporation().name === corp.NAME`     | `hasCorporation()`                             | `has_corp()` rewritten; no longer hard-codes the corp name |
| `createCorporation(corp.NAME, ...)`       | guard with `has_corp()` first                  | otherwise "Corporation exists" is thrown silently |

### Other helper updates

- `lib/util.js`:
  - `exec()` now logs a warning when `ns.exec` returns `0`.
  - Added `exec_chain()` helper (no `preventDuplicates`) for chain spawns.
- `lib/corporation/util.js`:
  - `smart_supply()` and `more_unlock_upgrade()` updated to the new unlock API.
  - `investment_offer()` now logs profit progress every 60s while waiting for
    the profit threshold (so the script does not appear silently stuck).
- `lib/io.js`:
  - `log()` switched from `ns.tprintf` to `ns.tprint` to avoid sprintf
    placeholders choking on strings like `"MP+10%"`.

### Chain spawning (RAM)

Chain scripts (`go.js` -> `prep.js` -> `agriculture.js` -> `tobacco.js` ->
`janitor.js`) use **`ns.spawn`** instead of `exec`/`exec_chain` so the parent
script exits before the child starts. This prevents RAM from stacking across
chain scripts (each script imports the heavy `Corporation` helper class, so
running two at once exceeds a 1 TB home server).

### `go.js`

- `main()` calls `corp_cleanup(ns)` at the start to remove stale `.txt`
  marker files (`prep.txt`, `agriculture.txt`, `tobacco.txt`, `janitor.txt`,
  `invest.txt`) so `resume()` does not false-positive.
- `resume()` path bug fixed: was `/corporation/*`, now `/quack/corporation/*`.
- `stage_one()` got detailed logging (funds before/after, each upgrade,
  each material buy) and uses `Intl.NumberFormat` (compact) instead of the
  removed `ns.nFormat`.
- `hire_advert` removed from `stage_one` (AdVert cost scales and is not
  worth it early).
- `enable_smart_supply` skips `"Energy"` (not a valid `CorpMaterialName` in
  the new API; was producing warnings).

### `prep.js`

- `main()` wrapped the sanity-check asserts in try/catch so a failure prints
  a readable error instead of an opaque thrown exception.
- Added `boost_revenue(ns, div)` which:
  - Buys the Smart Supply unlock (if missing) and enables Smart Supply with
    the `"leftovers"` option for each valid material in each city.
  - Cycles sell prices `MP-30%`, `MP-10%`, `MP`, `MP+10%`, `MP+50%` for
    `Plants` and `Food`, measuring profit over two 5s samples per price,
    and keeps the markup with the highest average profit delta. A fixed
    `MP+10%` guess frequently fails because the warehouse is empty or demand
    is weak, so empirical cycling is required.
  - Calls `setup_research_lab()` and `buy_market_ta()` to kick off research
    purchases as soon as the division has enough research points.
- `round_one()` calls `boost_revenue()` **before** `investment_offer()` so
  the corp actually becomes profitable while waiting for the $200k/s
  threshold (otherwise the threshold is unreachable and the script waits
  forever).
- `round_one()` also buys **AdVert** before `investment_offer()`. This is
  critical: a brand-new Agriculture division starts with a sales multiplier of
  about 0.07 (7%), which caps revenue at a small fraction of production no
  matter what sell price is set. AdVert raises awareness and therefore the
  sales multiplier; without it the $200k/s threshold is effectively
  unreachable. AdVert cost scales per purchase (linearly) so the first few
  rounds are affordable with the leftover funds after `go.js` (typically a
  few hundred million to ~$1B each). 3 rounds roughly takes the multiplier
  from 0.07 to 0.3-0.5 and lets the corp actually sell what it produces.
  - The AdVert buy is now **idempotent across restarts**: it reads
    `ns.corporation.getDivision(div).numAdVerts` first and only buys
    `(3 - numAdVerts)` rounds (skipping entirely when `numAdVerts >= 3`).
    AdVert's marginal benefit drops sharply after the first purchase
    (awareness decays back to a floor between buys; the cost climbs ~$1B+
    per round) so beyond 3 rounds it is not worth it in `prep.js`. The
    `janitor.js` maintenance script still buys AdVert frugally later via
    `hire_advert_frugal()` when profit justifies the cost.
- An earlier `boost_production()` helper (aggressive hiring + office
  upgrades + bulk material buys) was **removed** because it raised expenses
  faster than revenue scaled, which made the profit situation worse.
  Specifically, hiring 4 extra employees per office burned ~$30k/s in
  salary across 6 cities while production only ramped up slowly, and the
  office-size `while` loop read a stale `Office` snapshot and span
  forever (causing the game to kill all scripts with an out-of-memory
  error). The lesson: in `prep.js`, do not add anthropogenic hiring or
  material bulk buys before investment money arrives; let `hire_round_one`
  + `material_buy` do their jobs after the investment pays out.

### `agriculture.js` / `tobacco.js`

- These now `ns.spawn` the next chain script when done (previously
  `agriculture.js` did not spawn anything and `tobacco.js` used `exec`).

## Known runtime quirks

- `setSmartSupplyOption` rejects `"Energy"` because it is not in
  `CorpMaterialName`. The helper now skips it.
- The cycle-price probing in `boost_revenue` takes ~100s (5 prices x 2
  materials x 10s) during which reported profit is volatile; this is
  expected.
- `vivacious_office` only inspects cities where the division has actually
  expanded; it also logs progress every 60s and periodically buys tea and
  throws parties to accelerate morale/energy recovery (both efforts
  silently fail when funds are low, which is fine).

## Running the corporation chain from scratch

1. Make sure the player has access to the Corporation API (BN3 or source
   file) and the Office API + Warehouse API unlocks (purchasable in the
   Corporation UI, ~$200M total). In BN3 these are available from the start.
2. From the home terminal:
   ```
   run /quack/corporation/go.js
   ```
3. `go.js` creates the corporation, expands Agriculture to all 6 cities,
   hires 3 employees per office, sets up Smart Supply, sells materials,
   levels the 5 starter upgrades to level 2, buys the initial materials,
   then waits for every office to become "vivacious" (avg morale >= 100
   and avg energy >= 99.998).
4. Once vivacious, `go.js` calls `ns.spawn("/quack/corporation/prep.js")`.
5. `prep.js`:
   - Runs `boost_revenue()` to find a profitable sell price (critical;
     otherwise the $200k/s investment threshold is unreachable).
   - Accepts investment round 1 (needs $200k/s profit), hires more
     employees (6 stages), levels upgrades, upgrades warehouses, buys
     more materials.
   - Accepts investment round 2 (needs $300k/s profit), upgrades again.
   - Waits for offices to be vivacious again.
   - `ns.spawn("/quack/corporation/agriculture.js")`.
6. `agriculture.js` buys all Agriculture research (including
   `Hi-Tech R&D Laboratory`, `Market-TA.I`, `Market-TA.II`), then
   `ns.spawn("/quack/corporation/tobacco.js")`.
7. `tobacco.js` sets up the Tobacco division, runs product cycles,
   accepts investment rounds 3 and 4, etc., then
   `ns.spawn("/quack/corporation/janitor.js")` for maintenance.

## Things to watch for next session

- If `prep.js` stalls at `Waiting for sufficient profit: $200k/s` and profit
  is plateauing well below 200k, **first check the Agriculture division's
  sales multiplier in the Corporation UI**. If it is below ~0.3, the
  division needs AdVert — `prep.js` buys up to 3 rounds automatically (and
  is now idempotent: it tops up to 3 based on `getDivision().numAdVerts`,
  so restarting `prep.js` won't keep re-buying). If you are running an
  older copy or the script crashed before reaching that step, buy AdVert
  manually in the UI (1-2 clicks) to push the multiplier up. The
  cycle-price probing in `boost_revenue` may also
  have selected a bad markup; in that case rerun `prep.js` after deleting
  `/quack/corporation/invest.txt`.
- If a chain script exits without spawning the next one, check the home
  server's free RAM; each chain script needs ~730 GB on its own. The fix
  is to use `ns.spawn` (already in place) so the parent exits first.
- The `investment_offer` thresholds (`corp_t.profit.round.one.N = 2e5`,
  `two.N = 3e5`) are conservative; if the corp is consistently above them
  but the script seems to have skipped an investment round, check
  `/quack/corporation/invest.txt` for staleness.
- A common reason profit plateaus at ~$130k/s after `go.js` is that
  `go.js` expands Agriculture to **all 6 cities** in one shot (~$27-35B
  of the $150B seed), leaving only ~$1-2B for everything else. With
  AdVert not yet purchased, sales multiplier stays at ~0.07 and revenue
  is capped. The current `prep.js` mitigates this by buying AdVert before
  the investment threshold wait. A longer-term alternative (not applied)
  is to have `go.js` expand incrementally (1-2 cities first), but that
  requires restarting the corporation; we chose to keep the 6-city setup
  and rely on AdVert + investment to recover.
- Profit oscillates cycle-to-cycle (10s window) because `revenue` and
  `expenses` are both snapshot values that fluctuate with Market Price,
  warehouse stock depletion, and Smart Supply input purchases. A single
  `Profit: $X/s` log line is not a stable number; the trend over a few
  minutes is what matters.

## Outstanding ideas (not yet implemented)

- `go.js::stage_one` could expand incrementally (1 city -> wait for
  revenue -> expand next) instead of all 6 cities at once, to preserve
  capital for AdVert/Smart Supply early. Trade-off: longer time to full
  production, more complex code.
- `boost_revenue` cycle could be skipped entirely once Market-TA.II
  research is purchased (the game auto-sets prices then). Currently it
  still cycles even after TA.II is up; harmless but wastes ~100s.
- `boost_production` was removed; a future version could re-add a
  **very** conservative version (e.g. hire 1 Operations employee per
  office, only if office has spare capacity, only after investment
  round 1 is accepted) without the runaway-loop / salary-burn issues
  that caused the previous attempt to be deleted.
- `material_buy` was switched from `buyMaterial` (rate-based) to
  `bulkPurchase` (one-shot), which saves time but requires the corp to
  have the full cost up front. If funds are tight, `bulkPurchase` will
  silently fail and `material_qty` will not reach the target. Consider
  falling back to `buyMaterial` if `bulkPurchase` fails.
