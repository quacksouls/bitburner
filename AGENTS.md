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

## Session 2026-11-01 — additional fixes

### `prep.js`

- **`upgrade_round_one`**: Added funds-starvation detection. The
  original `for (;;)` loop only checked `level >= lvl` (target 10);
  `level_upgrade()` silently returns `FAILURE` when out of funds, so
  the script hung forever at the
  `Level up these upgrades: Smart Factories, Smart Storage` log line
  with no further output.  Now tracks consecutive ticks with no level
  change; if 6 ticks (~60s) pass with no level-up, breaks out, logs
  `funds-starved...`, and forwards to `level_up_storage` + `material_buy`.
  Also has a 600-tick (~10 minute) safety timeout.
- **`level_up_storage`**: Same pattern.  Original
  `while (!all_warehouses_upgraded(...))` could hang forever if
  `upgrade_warehouse` returned `FAILURE` due to insufficient funds.
  Now breaks after 30 consecutive 1-second ticks with no total
  capacity change.
- **`material_buy`**: Now logs when `org.material_buy` returns
  `FAILURE` (`cannot buy ${material} (insufficient funds or warehouse
  size); skipping`) instead of silently saying "Buying..." and doing
  nothing.
- **Removed `corp.material.ENERGY`** ("Energy") from the buy list.
  "Energy" is not a `CorpMaterialName` in Bitburner 3.0+ (only Water,
  Ore, Minerals, Food, Plants, Metal, Hardware, Chemicals, Drugs,
  Robots, AI Cores, Real Estate).  `getMaterial(div, ct, "Energy")`
  throws `should be a CorpMaterialName enum member`.  Agriculture in
  3.0+ requires only Water + Chemicals.  The constant
  `corp.material.ENERGY` is kept in `lib/constant/corp.js` because
  `enable_smart_supply` (corp.js:364) already filters it out via
  `Object.values(corp.material).filter(m => m !== corp.material.ENERGY)`.

### `lib/corporation/corp.js`

- **`material_buy`** (helper): Wrapped `bulkPurchase` in try/catch.
  Original only checked funds; if warehouse size was insufficient the
  game threw `You do not have enough warehouse size to fit this
  purchase`, crashing the script.  Now returns `bool.FAILURE` so the
  caller can skip and continue.
- **`buy_tea_all`**: Rewrote.  Original called `buyTea` for every
  office in every division unconditionally — wasted funds on offices
  already at energy 100 (energy does not need "topping up" past max).
  Now: collects `{div, ct, energy}` for all offices below the
  vivacious energy threshold (99.998), sorts ascending (lowest
  energy first), and only buys for offices that are not yet
  vivacious.  `break`s on the first fund failure so we don't waste
  API calls on subsequent offices that would also fail.
- **`party_all`**: Same pattern.  Skip offices with
  `avgMorale >= corp_t.employee.MORALE` (100).  Parties only boost
  morale, so throwing one for a maxed office wastes funds.
- **Why this matters**: `prodBase = avgMorale × avgEnergy × 1e-4`
  (OfficeSpace.ts:142).  Production of every role is
  `numEmployees[job] × prodMult[job] × prodBase`.  Energy 100 + Morale
  10 → `prodBase = 0.1` (10% throughput); 100 + 100 → 1.0 (100%).
  Skimping on tea/party directly slashes research throughput and
  revenue.

### `lib/constant/corp.js` — stale enums audit

Bitburner 3.0+ enum compare:
- `CorpResearchName` removed `JoyWire`, `sudo.Assist`,
  `Bulk Purchasing` (the latter was reclassified as an unlock, not
  research).  `lib/constant/corp.js` still had `corp.research.JOY`,
  `ASSIST`, `BUY` — removed.
- `CorpUnlockName` removed `VeChain`.  Removed `corp.unlock.CHAIN`.
- `CorpUpgradeName` removed `DreamSense`.  Removed
  `corp.upgrade.DREAM`.
- `tobacco.upgrade.round[n].DreamSense` (integer thresholds across
  9 rounds) — removed via regex replace.

### `corporation/agriculture.js` and `corporation/tobacco.js`

- Removed `corp.research.JOY` from research-wanted lists in both
  files (was triggering
  `getResearchCost: Argument researchName should be a CorpResearchName
  enum member. Provided value: "JoyWire"` runtime error).
- `tobacco.js::upgrade`: removed `DreamSense` from the upgrade
  list, removed `dream_lvl` constant, removed the two
  `corp.upgrade.DREAM` references in the level check and
  level-up block.

### `corporation/agriculture.js::research`

The script was stalling at
`Agriculture: unable to setup research lab` because
`setup_research_lab()` (util.js:524) only attempts the purchase
**once**.  Hi-Tech R&D Laboratory costs 5e3 research points, but
`has_enough_research_points` uses `RESEARCH_MULT = 2`, so the script
actually needs 10e3 points.  A fresh Agriculture division after
`prep.js` rarely has that many.  Original code:
```js
if (!setup_research_lab(ns, div)) {
    log(ns, `${div}: unable to setup research lab`);
    return;  // <-- main() sleeps 10min and retries, but same outcome
}
```

Fix: rewrote the start of `research()` to:
1. **Reassign at least 1 R&D employee per office** (instead of just
   calling `hire()` which hires for all roles).  Without R&D body,
   research points do not accumulate at all
   (`employeeProductionByJob[CorpEmployeeJob.RandD]` is the source).
   Reassign preference order: `Unassigned → Operations → Engineer →
   Management → Business` — i.e. take from where we have the most
   slack first, avoid hiring (saves salary + avoids office upgrade
   cost).  Only falls back to `hireEmployee(div, ct, "Research &
   Development")` if no donor role has any employee (office empty
   or everyone is in Training/Intern).  Uses
   `ns.corporation.setJobAssignment(div, ct, role, count)` which
   takes the **total count for that role** (not a delta).  Note:
   `setAutoJobAssignment` was removed in 3.0.0 — must use
   `setJobAssignment`.  `exclude "Unassigned"` as the job param
   (the API no-ops and returns false).
2. **Poll until research lab is bought**, instead of giving up
   immediately.  `while (!has_research(RND_LAB))` loops with
   `ns.sleep(wait_t.MINUTE)`, calling `org.buy_tea_all()` and
   `org.party_all()` each tick to keep `prodBase ≈ 1.0` so R&D
   employees generate research points at full speed.  When
   `has_enough_research_points` returns true, calls `buy_research`
   and breaks.
3. After RND_LAB, calls `setup_market_ta` and `buy_market_ta`.
   If `buy_market_ta` returns false (not enough points yet for
   TA.I/TA.II), logs and returns; `main()` will retry the whole
   `research()` call after 10 minutes.

## Session 2026-11-01 — buy_tea_all / party_all cost optimization

User feedback: after the previous fix (switching `agriculture.js::research`
from `ns.sleep(wait_t.MINUTE)` to `ns.corporation.nextUpdate()`), the
research lab now accumulates points fast in bonus time but burns too
much money on tea/party. After bonus time ends, morale/energy recover
too slowly with the frugal thresholds.

### Game mechanics (from `bitburner-src/src/Corporation/OfficeSpace.ts`)

- Tea: `buyTea(div, ct)` costs `teaCostPerEmployee = 500e3` ×
  `numEmployees`, raises `avgEnergy` by flat +2 next cycle, capped at
  `maxEnergy` (100 by default, +10 with `Go-Juice` research).
  `setTea()` no-ops if `teaPending` already true (so calling twice in
  the same cycle wastes the second call's funds but the game rejects
  it; office must have at least 1 employee).
- Party: `throwParty(div, ct, costPerEmployee)` costs
  `costPerEmployee × numEmployees`, sets `partyMult = 1 +
  costPerEmployee/10e6` for next cycle. Morale gain next cycle =
  `((avgMorale - 0.002*rand) * perfMult + (partyMult-1)*10) *
  partyMult`. `setParty` no-ops if `partyMult > 1` already (one party
  per cycle) or if `mult <= 1` (cost <= 0).
- Energy/morale decay per cycle: `reduction = 0.002 * marketCycles`
  (so ~0.002/cycle, ~0.01% — very slow). `perfMult = 1.002` if no
  interns, scales up to `~1.004` with 100% interns, drops below 1 if
  corp is losing money (penalty 0.001). So in steady-state with good
  profit and some interns, offices slowly *gain* energy/morale
  passively; tea/party are mostly needed to recover from shocks
  (large hires, office size upgrades, morale crashes after long
  neglect).
- `gameCyclesPerCorpStateCycle = 10` (50 cycles per market cycle / 5
  states), so `nextUpdate()` fires every 10 game cycles. Real-time per
  `nextUpdate` is ~2s normally, ~200ms in bonus time.
- `AutoBrew` research makes `autoTea = true` → `avgEnergy = maxEnergy`
  every cycle, free. `AutoPartyManager` research makes `autoParty =
  true` → `avgMorale = maxMorale` every cycle, free. Once both are
  purchased, the script does not need to buy tea/party at all.

### `lib/corporation/corp.js`

- **`buy_tea_all(threshold = corp_t.employee.ENERGY)`**: Added
  `threshold` parameter.  Default still 99.998 (preserves
  `vivacious_office` behavior of buying whenever energy is below
  "fully maxed").  Callers that only need throughput (not strict
  vivaciousness) can pass a lower threshold so tea is only bought
  when the office has drifted far enough that the +2 is not wasted by
  the cap.  Still sorts offices by ascending energy and `break`s on
  first fund failure.
- **`party_all(threshold = corp_t.employee.MORALE, costPerEmployee =
  1e6)`**: Added `threshold` and `costPerEmployee` parameters.
  Default threshold still 100 (max morale).  Default cost still
  $1M/emp (morale mult 1.1).  Lower cost (e.g. $100k/emp → mult 1.01)
  is useful for cheap maintenance once morale is near max; higher
  cost (e.g. $1M/emp) is better for fast recovery from low morale.
  Changed `catch` to not `break`: a small office might still be
  affordable even if a large one failed, so try them all.

### `corporation/agriculture.js::research`

Replaced the fixed `ns.sleep(wait_t.MINUTE)` in the R&D-lab poll loop
with `ns.corporation.nextUpdate()` (with fallback to `sleep(MINUTE)`
for older API).  This alone sped up research point accumulation by
~6-300× in bonus time.

Added **bonus-time-aware adaptive thresholds** to balance cost vs
recovery speed:

- `ns.corporation.getBonusTime() > 1000` → in bonus time.
- **Bonus time**: `teaThreshold = 97`, `partyThreshold = 95`.
  Bonus time runs many cycles per real second, so even with frugal
  thresholds the office drifts and gets topped up many times → fast
  recovery.  The frugal thresholds save a lot of money across
  thousands of cycles (e.g. avoid buying tea every cycle when
  energy is already 99.5 and the +2 is mostly wasted by the cap).
- **Real time**: `teaThreshold = 99`, `partyThreshold = 98`.
  Real time is ~10s per cycle, so cycles are scarce — we must buy
  almost every cycle to keep morale/energy near max.  With
  `teaThreshold = 97`, the office would drift for 15-25 cycles (many
  minutes of real time) before triggering a tea purchase, operating
  below peak throughput the whole time.
- **Adaptive party cost**: scan all offices for the lowest morale.
  If any office is more than 5 below the party threshold, use
  `$1M/emp` (mult 1.1, fast recovery); otherwise use `$100k/emp`
  (mult 1.01, cheap finish to nudge morale up).  This avoids
  bleeding $1M per party per cycle in steady state, while still
  recovering quickly from crashes.

The `research()` loop does not need strict vivaciousness (>= 99.998)
— it only needs good R&D throughput, which scales as
`avgMorale × avgEnergy × 1e-4`.  An office at 95/95 has ~90% of the
throughput of one at 100/100; the saved funds accelerate buying the
actual research we are waiting for.  Once `AutoBrew` +
`AutoPartyManager` research are purchased, the loop is a pure no-op
for tea/party anyway (game auto-maintains max energy/morale free).

## Session 2026-11-02 — morale/energy stuck at 10; party_all not sorting

User feedback: after the 2026-11-01 fixes, energy recovered fine but
morale hung around 10 and never climbed. Two root causes:

### Bug 1: `agriculture.js::research` tea/party loop ended early

The while loop only wrapped the wait for Hi-Tech R&D Laboratory:

```js
while (!org.has_research(div, corp.research.RND_LAB)) {
    // ... buy_tea_all + party_all + nextUpdate ...
}
setup_market_ta(ns, div);
if (!buy_market_ta(ns, div)) { log(...); return; }
for (const r of res) { ... buy_research ... }
```

Once RND_LAB was purchased the loop exited, `setup_market_ta` +
`buy_market_ta` ran once (returned `false` because TA.I/TA.II RP not
yet accumulated), and `research()` returned to `main()`, which then
slept `10 * wait_t.MINUTE`. During that 10-minute gap (and during the
subsequent wait for TA RP) **no tea or party was bought**, so with
`perfMult=0.998` per state cycle and ~2s per cycle, morale/energy
decayed from ~100 down to the `minEmployeeDecay` floor of 10 after
~30-40 minutes — exactly what the user observed.

Fix: replaced the `while (!has_research(RND_LAB))` loop with a single
`while (!has_all_research(ns, div, res))` maintenance loop that stays
alive as long as any research in `res` is still wanted. Each iteration:

1. Detect bonus time and set thresholds (see Bug 2 below).
2. Compute `lowestMorale` across all offices.
3. `buy_tea_all(teaThreshold)` + `party_all(partyThreshold, partyCost)`.
4. If RND_LAB not yet owned and enough RP → buy RND_LAB. Else run
   `setup_market_ta` + `buy_market_ta` and try to buy any other
   affordable research in `res`.
5. `await ns.corporation.nextUpdate()` (fallback `ns.sleep(SECOND)`).

`setup_research_lab` import removed (no longer used). The loop now
guarantees tea/party every state cycle for the entire R&D phase, not
just the RND_LAB wait, so morale/energy stay pinned near 100 the
whole time.

### Bug 2: real-time thresholds too low; cheap-party finisher can't climb

`getBonusTime()` returns **milliseconds** (NetscriptDefinitions.d.ts
~10722), not seconds. The previous check `getBonusTime() > 1000` only
required 1 second of bonus time to qualify, so the script frequently
picked the frugal bonus thresholds (97 tea / 95 party) in real time.

Worse, with the cheap-party finisher ($100k/emp = mult 1.01 ≈
+0.6 morale/cycle) and `perfMult=0.998` natural decay, the office
could recover from 95→100 only over ~8-10 cycles in bonus time, but
in real time (~2s/cycle) that takes 16-20s of drift and never actually
reaches 100 because decay eats most of the +0.6.

Fix: raise the bonus cutoff to `getBonusTime() > 60e3` (60s) so
short-lived bonus tails don't trigger frugal thresholds. Use
`corp_t.employee.ENERGY` (99.998) and `corp_t.employee.MORALE` (100)
in real time — strict vivacious thresholds that buy tea/party every
cycle that the office is not maxed. Real-time `partyCost` is always
`$1M/emp` (mult 1.1, +~8 morale/cycle) so morale climbs from 10→100
in ~10-15 cycles (~20-30s real). Bonus time keeps the adaptive
`$100k`/`$1M` switch to save money across thousands of fast cycles.

### Bug 3: `buyTea`/`throwParty` are silent no-ops, not throws

`bitburner-src/src/Corporation/Actions.ts:384-404`:

```ts
export function buyTea(corp, office): boolean {
  const cost = office.getTeaCost();
  if (corp.funds < cost || !office.setTea()) return false;  // not throw
  corp.loseFunds(cost, "tea");
  return true;
}
export function throwParty(corp, office, costPerEmployee): number {
  const mult = 1 + costPerEmployee / 10e6;
  const cost = costPerEmployee * office.numEmployees;
  if (corp.funds < cost) return 0;          // not throw
  if (!office.setParty(mult)) return 0;     // not throw
  corp.loseFunds(cost, "parties");
  return mult;
}
```

The previous `try { ns.corporation.buyTea(...) } catch { break; }` and
`try { ns.corporation.throwParty(...) } catch { ... }` wrappers never
caught anything — the funds-shortfall path is a silent return, so the
script thought it was buying tea/party when it wasn't.

Fix in `lib/corporation/corp.js`:

- `buy_tea_all`: read `getConstants().teaCostPerEmployee`, compute
  `teaCost = teaCostPerEmp * office.numEmployees`, and only call
  `buyTea(div, ct)` when `this.funds() >= teaCost`. Break on first
  unaffordable office (offices are sorted ascending by energy, so the
  smaller-energy ones are already covered).
- `party_all`: same pattern; `if (this.funds() < cost) continue;`
  before calling `throwParty`. `continue` (not `break`) so smaller
  downstream offices that are still affordable get a party too. This
  pairs with Bug 4 below.

### Bug 4: `party_all` did not sort offices by morale

`buy_tea_all` already collected `(div, ct, energy)` triples and sorted
ascending by energy so the lowest-energy office got tea first when
funds were tight. `party_all` had no sort: it iterated `cities.all` in
fixed order and skipped offices only when `funds() < cost`. With 6
offices and limited funds, the same 1-2 alphabetical-first offices got
a party every cycle (refreshing them toward 100) while the 4 offices
that had actually fallen behind never got touched — they kept
decaying, falling further behind, and never recovered. User reported
"morale stuck low; the lowest ones are not being touched."

Fix: collect `{div, ct, morale, cost}` for all sub-threshold offices,
`sort((a, b) => a.morale - b.morale)`, then iterate and throw a party
for as many as funds allow (lowest morale first). This mirrors the
`buy_tea_all` pattern and guarantees the most-depleted offices get
priority when funds are scarce.

### Files changed

- `src/corporation/agriculture.js`:
  - Import: removed `setup_research_lab`, added `corp_t`.
  - `research()`: rewrote post-RND_LAB flow into a single
    `while (!has_all_research(ns, div, res))` maintenance loop with
    tea/party + research-buying each state cycle.
  - Bonus threshold: `getBonusTime() > 60e3` (was `> 1000`).
  - Real-time thresholds: `corp_t.employee.ENERGY` / `MORALE`
    (was hardcoded 99/98).
  - Real-time `partyCost` always `$1M/emp` (no `$100k` finisher).
  - Fallback sleep changed from `wait_t.MINUTE` to `wait_t.SECOND`
    (matches state-cycle cadence).
- `src/lib/corporation/corp.js`:
  - `buy_tea_all`: pre-check `funds() >= teaCost` before `buyTea`
    (replaces try/catch that never caught anything).
  - `party_all`: collect sub-threshold offices, sort ascending by
    morale, `continue` (not `break`) on fund shortfall so smaller
    downstream offices can still be served.

## Session 2026-11-04 — research buying silent / R&D throughput too low

User feedback: after TA.I/TA.II were purchased, the script appeared
stuck — no further "buying research" log lines for a long time.

Three causes:

1. `buy_market_ta()` (util.js:45-58) buys `Market-TA.I` and
   `Market-TA.II` **silently** — no `log()` call. So the user never
   saw "buying research: Market-TA.I" lines.
2. After RND_LAB + TA.I + TA.II were owned, the next target was
   AutoBrew (10k cost × `RESEARCH_MULT=2` = 20k RP threshold). The
   `while (!has_all_research)` loop had no progress log while waiting
   for RP, so it looked dead for many minutes.
3. The pre-loop reassign block in `agriculture.js::research` only
   moved **1** employee per office into R&D (each office kept its
   2 Ops / 2 Eng / 2 Bus / 2 Mgmt; only 1 R&D per office). With
   6 offices × 1 R&D = 6 R&D employees total, RP throughput was
   very low — ~30 RP/s in real time, so reaching 20k took ~10+ min
   per AutoBrew, and the full AGRI research list (≈500k RP) took
   many hours of real time.

### `corporation/agriculture.js`

- **Reassign aggressively toward R&D.** Replaced the "move 1
  employee from one donor role per office" logic with: keep at
  least 1 employee in each of Operations/Engineer/Business/
  Management (so material production and sales keep working);
  move **every** spare employee (Unassigned, Training, and the
  surplus of Ops/Eng/Mgmt/Business above 1) into R&D. This takes
  each office from ~0 R&D to ~half-its-staff-in-R&D in one shot
  (e.g. an 8-employee office becomes 4 R&D + 1 each of the four
  production roles), boosting RP throughput by ~5-8× and bringing
  the full research phase down to a few minutes of real time.
  `setJobAssignment` writes to `employeeNextJobs` (OfficeSpace.ts:41,
  applied at the next `process()` cycle), so first reducing each
  donor to its "keep" count (releases employees to Unassigned) and
  then setting R&D to `curRnd + freed` is a valid transaction.

- **Progress log every 30 cycles** in the `while
  (!has_all_research)` loop. Each cycle ≈ 2s real / 200ms bonus,
  so the log fires roughly every 60s real / 6s bonus — exactly the
  cadence the user wants between "is this thing doing anything?"
  checks. The log prints: current division RP, the next target
  research + its 2× RP threshold, total R&D employees across the
  division, lowest avgMorale/avgEnergy across offices, funds, and
  whether we are in bonus time. Now the user can see at a glance
  whether RP is growing or stalled, what the script is waiting for,
  and how low morale/energy are (which would explain a throughput
  drop).

## Session 2026-11-05 — tobacco profit âm trong khi chờ product

User feedback: script dừng ở "waiting for product to complete: Gutka"
rất lâu, Corp UI profit Tobacco < 0.

### Nguyên nhân

Trong `product_cycle`, sau khi `create_product` script gọi
`finishing_product(ns, div, name)` (util.js:192), vòng lặp chỉ poll
`is_product_complete` mỗi 1s với **không log gì**. Trong thời gian chờ
(thường 1-10 phút real time tùy số Engineer/Operations/bonus time):

- Tobacco revenue = 0 (chưa sell product)
- Tobacco expenses > 0 (salary 6 offices + warehouse + materials)
  → Tobacco profit âm, kéo tổng corp profit xuống.

Hơn nữa morale/energy decay chậm trong lúc chờ, làm prodMult
(FloorSpace.ts:171) giảm, làm product development còn chậm hơn.

### `corporation/tobacco.js`

- Added `in_bonus_time(ns)`, `maintain_offices(ns)`, and
  `next_cycle(ns)` helpers that mirror the bonus-time-aware
  tea/party logic from `agriculture.js::research`:
  - Bonus time (`getBonusTime() > 60e3`): frugal thresholds
    (97 tea / 95 party) and adaptive party cost ($100k steady /
    $1M recovery), since many fast cycles absorb the oscillation.
  - Real time: strict vivacious thresholds
    (`corp_t.employee.ENERGY=99.998` / `MORALE=100`) and $1M/emp
    party every cycle that morale is not maxed, since cycle scarcity
    means we must recover aggressively.
- `wait_product(ns, div, name)` (replaces `finishing_product` in
  `product_cycle`):
  - Calls `maintain_offices` each cycle so morale/energy stay
    pinned near 100 → prodMult stays high → product develops faster.
  - Logs `% | corp profit | funds | BONUS/real` every 30 cycles,
    but only when the integer percent actually changes (avoids spam
    in bonus time where 30 cycles can pass in ~6s).
- `research(ns)` and `more_research(ns)`: rewrote the
  `for(;;) { ... await ns.sleep(5..10 * wait_t.MINUTE) }` loops to
  use `maintain_offices` + `next_cycle` + the same progress log
  format as agriculture.js (`RP current/target for nextTarget |
  funds | BONUS/real`), so the user sees RP accumulating instead of
  silence.  Initial R&D hire happens once up-front (not per cycle).

## Session 2026-11-05 — tobacco profit still negative after Gutka; dev too slow

User feedback: after product Gutka finished development, Tobacco
profit became **more** negative (worse than during development).
Plus: product development is too slow (1-10% progress).

### Nguyên nhân

1. **Sales multiplier ~0.07** — a brand-new Tobacco division
   starts with sales multiplier 0.07 (7%), so only 7% of produced
   goods sell. Without AdVert, even a finished product generates
   negligible revenue while expenses (salaries ~ tens of $/s,
   warehouse upgrades, materials) keep ticking.  This is why
   profit got *more* negative after Gutka finished — the script
   kept paying expenses but the product barely sold.

2. **Only 1 AdVert round** — `product_cycle` called
   `hire_advert` (single, blocking) right before sell_product,
   bumping the multiplier only once and waiting indefinitely for
   funds — often this happened *after* the long wait_product
   loop, so awareness had decayed back to the floor.

3. **Product development too slow** — progress per cycle is
   `marketCycles * 0.01 * prodMult` where
   `prodMult = (engrProd^0.34 + opProd^0.2) * mgmtFactor`
   (Product.ts:121).  The developer city (Aevum) had only ~9
   Engineers + 8 Operations = 25 production employees (stage 1
   caps). Adding more Engineers (exponent 0.34 > Operations
   0.2) meaningfully speeds up development.

### `corporation/tobacco.js`

- Added `hire_advert_burst(ns, div, maxRounds)` — buys multiple
  AdVert rounds idempotently (tops up to `maxRounds` total based
  on `getDivision(div).numAdVerts`), frugally (each round's cost
  must be < `FRUGAL_FRACTION = 0.2` of current funds; otherwise
  stops and logs the budget shortfall).  Default target is 5
  rounds.
- Added `boost_developer_city(ns, div)` — adds 1 Engineer (or
  Operations, alternating, since Engineer exponent is higher)
  to the developer city (Aevum), non-blocking:
  - If office has spare capacity, simply hire (free).
  - If at capacity, upgrade office size only if the upgrade cost
    < `FRUGAL_FRACTION` of funds; otherwise return.
  - Caps total Eng+Ops in Aevum at 40 to avoid bloating salaries.
- Added `seed_developer_city(ns, div, target)` — blocks until
  Eng+Ops in Aevum reach `target` (default 25) or funds run out,
  so the product starts development with a decent prodMult
  up-front.
- `product_cycle`:
  - Calls `hire_advert_burst(5)` BEFORE creating the product,
    so awareness is already up while the product is being
    developed (and once more before sell_product, idempotent, in
    case awareness decayed).
  - Calls `seed_developer_city(25)` before `create_product` so
    the product starts with a fast prodMult.
- `wait_product`:
  - Calls `boost_developer_city` every 30 cycles so Aevum keeps
    growing during the wait (cheaply).
  - Progress log now also reports the Engineer + Operations count
    in Aevum so the user can see it growing, e.g.
    `Tobacco/Gutka: 12% | corp profit $-150/s | funds 1.8e9 | 11E+9O in Aevum | BONUS`.
- Removed unused `hire_advert` import (was replaced by
  `hire_advert_burst`).

## Session 2026-11-05 — tobacco "no log" stuck at upgrade loop

User feedback: re-ran the script after the previous fixes but now
saw no log at all (script appears hung with no output).

### Nguyên nhân

`upgrade(ns, n)` trong tobacco.js là một `for(;;)` vô hạn chỉ gọi
`level_upgrade` mỗi 1s.  `level_upgrade` (corp.js:890) **trả về
FAILURE im lặng** khi `funds() < cost` — không throws, không log.
Sau khi in "Round X of upgrades: ..." ở đầu, vòng lặp cứ lặp 1s
một gọi level_upgrade mà không có dòng log nào thêm; tổng level
upgrade không đổi (vì không đủ tiền); script stuck mãi mãi ở
đây, không vào `wait_product` hay `monitor_product_sales`.

Đây là đúng pattern đã được fix trong `prep.js::upgrade_round_one`
(đã ghi trong AGENTS.md "Session 2026-11-01").

### `corporation/tobacco.js`

- `upgrade(ns, n)`: thêm funds-starvation detection.
  - Track tổng level của 6 upgrades (Focus/Neural/Speech/Injector/
    Insight/Analytic) qua mỗi tick.
  - Nếu 60 ticks (60s) mà tổng level không đổi → log
    "funds-starved, 60s with no level change; deferring remaining
    levels to janitor.js" + bảng trạng thái levels hiện tại vs
    target + funds, rồi `break` để script tiếp tục.
  - janitor.js::level_upgrade (đã có sẵn trong maintenance loop)
    sẽ top-up các upgrade còn thiếu khi corp có profit dương.

## Session 2026-11-05 — tobacco product not selling (UI 0.000/0.000)

User feedback: re-ran the script, but product (Gutka) still shows
"Sell (0.000/0.000)" in the Corp UI — production done but nothing
was sold.

### Nguyên nhân

Khi user re-run tobacco.js, product Gutka đã tồn tại trong save
với `developmentProgress = 100` (từ lần run trước khi script bị
kill giữa `wait_product` và `sell_product`).  Trong `main()`:
- `product_cycle("one")` kiểm tra `has_init_max_products` — count
  Gutka là 1 product → hiện đã có 1 product = `INIT_TAU = 3`??? không;
  `INIT_TAU = 3`, 1 < 3 → `has_init_max_products` return false;
  product_cycle tiếp tục tạo product mới "Beedi" (random name) thay
  vì sell Gutka đã có.
- Trong khi đó, Gutka `desiredSellAmount = null` (không bao giờ
  được set vì `sellProduct` chưa call lần trước) → UI hiển thị
  "Sell (0.000/0.000)" và revenue = 0 mãi mãi.

Root cause: script không check/sell existing products khi startup.

### `corporation/tobacco.js`

- Thêm `sell_existing_products(ns)` — scan tất cả products trong
  Tobacco division, với mỗi product đã `is_product_complete` (`developmentProgress
  >= 100`) và có `cityData[city].desiredSellAmount === null` (chưa
  put up for sale), gọi `sell_product` để set desiredSellAmount =
  MAX / sellPrice = MP+10% + enable market TA.  Log:
  `Tobacco/Gutka: rescue-selling existing finished-but-unsold product`.
- `main()` gọi `sell_existing_products(ns)` ngay sau `setup_division`
  + `expand_city` + `smart_supply`, **trước** `investment_offer("three")`
  để các product cũ có revenue ngay trước khi vào wait threshold
  $1M/s.

Giờ khi re-run script, các product cũ đã xong sẽ được sell ngay,
UI hiển thị "Sell (X/MAX) @ $Y" thay vì "0.000/0.000".

## Session 2026-11-05 — `sell_existing_products` crash + rescue not triggering

User feedback: re-ran tobacco.js after the previous "rescue-selling"
fix; got a crash:

```
TypeError: Cannot read properties of undefined (reading 'Sector-12')
    at sell_existing_products (tobacco.js:362:23)
```

### Root cause 1: `cityData` is internal-only in 3.0+

The script read `p.cityData[ct0].desiredSellAmount`.  In Bitburner 3.0+
the object returned by `ns.corporation.getProduct(div, ct, name)` to
scripts is a **flat** object assembled in
`NetscriptFunctions/Corporation.ts:260-278` — it does NOT expose the
internal `cityData` map.  `p.cityData` is `undefined`, so
`p.cityData[ct0]` throws `Cannot read properties of undefined
(reading 'Sector-12')`.

The game's internal `Product` class (Corporation/Product.ts:64-83) does
have a `cityData = createEnumKeyedRecord(CityName, ...)` field, and
Division.ts / Actions.ts use it internally, but the Netscript wrapper
flattens it per-call (each `getProduct` call reads `cityData[cityName]`
and copies fields up to the top level).  Scripts must use the flat
`p.desiredSellAmount`, `p.actualSellAmount`, `p.stored`, `p.effectiveRating`,
etc. directly (no `p.cityData[ct].*`).

Fix: replaced `p.cityData[ct0].desiredSellAmount` with
`p.desiredSellAmount`, and moved the `getDivision(div).cities[0]`
lookup before the loop (it's constant across iterations).

### Root cause 2: rescue not triggering (default is 0, not null)

After fixing the crash, the rescue still did not fire for an existing
unsold product.  Cause: in Bitburner 3.0+ a freshly-created Product's
`desiredSellAmount` defaults to **`0`** (Product.ts:79 —
`desiredSellAmount: 0 as number | string`), NOT `null`.  The
previous check `if (p.desiredSellAmount !== null && p.desiredSellAmount
!== undefined) continue` evaluated `0 !== null && 0 !== undefined` →
`true` → `continue` (skip) → no rescue.  The product stayed at
"Sell (0.000/0.000)" forever, exactly the symptom the user saw.

Once `sellProduct` is called with `amt="MAX"`, the field becomes the
string `"MAX"` (truthy).  So the "needs rescue" signal is any falsy
value: `0`, `""`, `null`, `undefined`.  A truthy check
(`if (p.desiredSellAmount) continue`) skips products already on sale
and rescues the rest.

Fix: switched the check to `if (p.desiredSellAmount) continue` and
added a log line that prints the raw `desiredSellAmount` value (via
`JSON.stringify`) when rescuing, plus a count summary at the end, so
future debugging is easier.

### `corporation/tobacco.js::sell_existing_products`

```js
const ct0 = ns.corporation.getDivision(div).cities[0];
let rescued = 0;
for (const name of products) {
    if (!org.is_product_complete(div, name)) continue;
    const p = ns.corporation.getProduct(div, ct0, name);
    if (p.desiredSellAmount) continue;  // truthy => already on sale
    log(ns, `${div}/${name}: rescue-selling existing finished-but-unsold product (desiredSellAmount=${JSON.stringify(p.desiredSellAmount)})`);
    sell_product(ns, div, name);
    rescued++;
}
if (rescued > 0) log(ns, `${div}: rescue-sold ${rescued} product(s)`);
```

### `corporation/tobacco.js::monitor_product_sales`

Same `p.cityData[ct].*` bug existed here (`actualSellAmount` /
`stored`, tobacco.js:570-571).  Would have crashed the first time
`monitor_product_sales` ran after a product was sold.  Fixed in the
same session: switched to flat `p.actualSellAmount` / `p.stored`
(these are per-city because `getProduct(div, ct, name)` is called
inside the `divCities` loop, so each read reflects the city passed
in).

## Session 2026-11-05 — re-run script creates duplicate products

User feedback: after killing tobacco.js mid-development (e.g. during
`wait_product` on Gutka), re-running the script caused it to create
**new** products from scratch instead of finishing the existing
half-developed one. Result: extra products, wasted dev time, and the
script burning through `product_cycle("one"|"two"|"three")` regardless
of prior state.

### Root cause

`product_cycle(ns, n)` only short-circuits when
`products.length === corp_t.product.INIT_TAU` (= 3). It does not check
"did this round's product already get created in a prior run?". So when
a previous run was killed during `wait_product`, the half-developed
product counts toward `length`, but `length < 3` so the loop proceeded:
- `product_cycle("one")`: length=1 → still < 3 → created ANOTHER product
- `product_cycle("two")`: length=2 → still < 3 → created ANOTHER
- `product_cycle("three")`: length=3 → finally skip

Meanwhile the original half-developed product never received any more
`wait_product` cycles → stuck at partial progress forever.

### `corporation/tobacco.js::product_cycle`

Resume logic added at the top of the function:

1. Scan `org.all_products(div)` for any product whose
   `is_product_complete` returns false (i.e. `developmentProgress
   < corp_t.MAX_PROGRESS`).
2. If one is found, set `resumeName = p` and `break` (adopt the first
   in-development product).
3. Skip the round early when:
   - `resumeName === null && has_init_max_products(ns)` — at INIT_TAU
     and nothing half-done → all three rounds complete.
   - `resumeName === null && products.length >= to_number(n)` — this
     round's product already exists from a prior run.
4. After the advert/seed/upgrade preamble, branch:
   - If `resumeName` is set: log "resuming development of existing
     product: X" and skip `create_product` (which would otherwise
     allocate a new product slot with a random name).
   - Otherwise: `create_product` as before.

This means: kill mid-development → restart script → script finishes the
half-developed product, sells it, then proceeds to the next round
normally.

### Verified scenarios

- Fresh start (0 products): round one/two/three each creates a new
  product (no in-dev to resume). Identical to prior behavior.
- Kill during round one wait (Gutka in-dev, length=1): round one
  resumes Gutka → finish + sell. Round two/three create new (length 1→2→3).
- Kill during round two wait (one sold + one in-dev): round one adopts
  the in-dev product (regardless of "round ownership" — products are
  interchangeable from the script's perspective). Round two/three skip
  or create as needed.
- Kill during round three wait (two sold + one in-dev): round one
  finishes the in-dev product. Round two/three skip (length=3,
  has_init_max_products true).
- Multiple in-dev products (rare, from repeated kills + restarts): each
  `product_cycle` round adopts one until none remain, then creates new.

## Session 2026-11-05 — `wait_product` no log when product stuck at 0% progress

User feedback: "vòng lặp designing không có dấu hiệu dừng" — the
product stays in "Designing" status in the Corp UI forever, and the
script emits no log lines.

### Root cause

`wait_product` only logged when `pct` (integer progress) changed:
```js
if (pct !== lastPct) { log(...); lastPct = pct; }
```

If the product never progresses (pct stays at 0% or stuck at some
value), **zero log lines** are emitted. From the user's perspective:
UI says "Designing", script tail is empty, looks like an invisible
infinite loop.

Why would progress stay at 0? Per `Product.ts:106-110`:
```ts
const opProd = employeeProd[Operations];
const engrProd = employeeProd[Engineer];
const mgmtProd = employeeProd[Management];
const total = opProd + engrProd + mgmtProd;
if (total <= 0) return;  // <-- hard stop, no progress
```

If Aevum (the developer city, `tobacco.DEVELOPER_CITY`) has 0
Engineers, 0 Operations, AND 0 Management, `total = 0` and the
product never gains any developmentProgress. This typically happens
after a restart where the office's job assignments have been reset
or shuffled (e.g. user manually reassigned everyone to R&D, or a
prior run's `research()` left everyone in R&D before the script
got to creating product).

### `corporation/tobacco.js::wait_product`

Two changes:

1. **Always log when stuck**. Track `noChangeStreak` — number of
   consecutive 30-cycle checks where `pct` did not change.  Log a
   "no progress heartbeat" every 3rd stuck check (90 cycles = ~180s
   real / ~18s bonus), so the user sees the script is alive AND sees
   the Eng/Ops counts to diagnose `0E+0O`. After `MAX_NO_CHANGE = 10`
   checks (300 cycles = ~10 min real / ~60s bonus), log a STUCK
   warning and `break` so the script stops bleeding funds on a
   product that will never complete.
2. The progress log condition now uses a `progressed` flag captured
   BEFORE `lastPct = pct` is updated — the previous version compared
   `pct !== lastPct` AFTER setting `lastPct = pct` (always false),
   which would have never logged on progress. (Bug caught during
   self-review of the first draft.)

Log format:
- Progress: `Tobacco/Gutka: 12% | corp profit $-150/s | funds 1.8e9 | 11E+9O in Aevum | BONUS`
- Stuck:    `Tobacco/Gutka: 12% | corp profit $-150/s | funds 1.8e9 | 0E+0O in Aevum | BONUS (no progress 90cyc)`
- Bailout:  `Tobacco/Gutka: STUCK at 12% for 300 cycles | 0E+0O+0M in Aevum | ... Aevum needs Engineers/Operations/Mgmt ...`

After STUCK bailout, `wait_product` returns and the caller
(`product_cycle`) proceeds to `sell_product` (which requires
`is_product_complete` and would assert), so the script will fail
loudly on the next assert rather than silently burning funds.
The user can then manually fix Aevum's office assignments and
re-run.

## Session 2026-11-05 — `enhanced_product_cycle` discontinue-and-recreate loop

User feedback: "RYO complete xong lại research RYO?" — the script
completed product RYO, sold it, then immediately discontinued RYO and
created a new product also named RYO. Infinite loop: each round
finishes a product then throws it away.

### Root cause

`enhanced_product_cycle` used `has_init_max_products` (constant 3)
to decide whether to discontinue:
```js
if (has_init_max_products(ns)) {     // length === 3
    discontinue_product(ns, div);    // picks lowest-rating product
}
```

After the script purchased Capacity.I + Capacity.II research, the
division's actual `maxProducts` became **5** (Division.ts:46-52):
```ts
let additional = 0;
if (this.hasResearch("uPgrade: Capacity.I")) ++additional;
if (this.hasResearch("uPgrade: Capacity.II")) ++additional;
return corpConstants.maxProductsBase + additional;  // 3 + 2 = 5
```

But `has_init_max_products` still compared to `INIT_TAU = 3`. So at
length === 3 (just finished a product, hasn't created a new one
yet), `has_init_max_products` returned true and the script
discontinued one — and `discontinue_product` picks the
**lowest-rating** product. A brand-new product (just finished dev
that cycle) typically has a low rating (development time was short,
few research upgrades were active during dev), so it gets picked
for discontinuation. Then `product_cycle` creates a new product
(random name from the 20-name pool — sometimes the same name as the
discontinued one since `product_name` only checks
`!has_product`, and we just discontinued it).

Net effect: each enhanced round throws away the previous round's
work and starts over. The user sees no net progress.

### `corporation/tobacco.js`

Added `has_max_products(ns)` that respects Capacity research:
```js
let cap = corp_t.product.INIT_TAU;  // 3
if (has_research(div, CAPACITY_I)) cap++;
if (has_research(div, CAPACITY_II)) cap++;
return all_products(div).length >= cap;
```

Switched `enhanced_product_cycle` to use `has_max_products` instead
of `has_init_max_products`. Now the script only discontinues when
the product list is at the **actual** current cap (3, 4, or 5),
not at the constant 3. After buying Capacity research, rounds 4
and 5 will create products up to length=5 without discontinuing
the previous round's work. Only when length=5 (after round 5
completes) will round 6 discontinue one to make room.

Also clarified the JSDoc on `has_init_max_products` is for the
initial-cap short-circuit in `product_cycle` (rounds 1-3) — kept
as-is (still correct for that use case).

## Session 2026-11-05 — `more_unlock_upgrade` infinite loop on expensive unlocks

User feedback: "Script đã dừng hẳn" after `Tobacco: all extra
research purchased`. No further log lines until user killed it.

### Root cause

`more_unlock_upgrade` (util.js:421) had the same funds-starvation
infinite loop pattern that was fixed earlier in
`prep.js::upgrade_round_one` and `tobacco.js::upgrade`:

```js
while (!org.has_unlock_upgrade(upg)) {
    org.buy_unlock_upgrade(upg);     // returns FAILURE silently when funds < cost
    await ns.sleep(wait_t.SECOND);   // sleep 1s, loop forever
}
```

The two unlock upgrades it targets are endgame-priced:
- `Shady Accounting`: **$500T** (500e12)
- `Government Partnership`: **$2Q** (2e15 = $2000T)

User had $82B in funds — 4-5 orders of magnitude short. The
`buy_unlock_upgrade` helper checks `funds() < cost` and returns
`bool.FAILURE` silently (corp.js:130-135), so `has_unlock_upgrade`
stays `false` forever and the loop spins every 1s emitting **no log
lines**. From the user's tail it looked like the script just hung
silently after the research phase.

These unlocks are nice-to-have (they reduce the corp's "tribute"
payout to the player by 0.05 and 0.1 respectively) and are NOT
required for the corp to function or for janitor.js to take over
maintenance. Deferring them is safe.

### `lib/corporation/util.js::more_unlock_upgrade`

Two changes:

1. **Up-front funds check**: before entering the purchase loop,
   compare `getUnlockCost(upg)` against `funds()`. If funds are
   insufficient, log
   `Cannot afford ${upg} ($cost > funds $funds); deferring — script
   will proceed without this unlock upgrade` and `continue` to the
   next upgrade (or exit the function). No loop entered.
2. **Starvation detection** (safety net for a race where funds drop
   after the up-front check passes but before the loop buys): track
   `noChangeTicks` — number of consecutive failed
   `buy_unlock_upgrade` calls. After `MAX_NO_CHANGE = 60` (60s),
   log `${upg}: funds-starved, 60s with no purchase; deferring` and
   `break`.

After this fix, `before_going_public` returns promptly even when
the corp is not yet rich enough to afford Shady Accounting /
Government Partnership, and `tobacco.js::main` proceeds to
`ns.spawn("/quack/corporation/janitor.js")`. The deferred unlock
upgrades can be bought later by janitor.js (or manually) once the
corp has accumulated enough profit.

## Session 2026-11-05 — port funds-starvation + silent-loop fixes to janitor

After tobacco.js spawn janitor.js, user asked what happens next and
whether janitor had the same silent-hang bugs that were fixed in
tobacco.js/prep.js/util.js.  Three places had the same infinite loop
pattern.

### `corporation/janitor.js`

Rewrote `wait_product` (inline, replaced the silent
`finishing_product` import) to mirror `tobacco.js::wait_product`:
- Polls `developmentProgress` every 30 cycles
- Logs `% | NE+NO in Aevum` on every progress change
- Logs `STUCK at X% for Ns` and bails out after `MAX_STUCK_CHECKS=10`
  consecutive checks with no percent change — typically caused by
  the developer city (Aevum) office having 0 Engineers/Operations,
  which makes `Product.createProduct` (Product.ts:106-110) return
  early with zero progress.

`go_public` now:
- Skips immediately if already public (was spinning
  `while (!is_public()) { go_public(); sleep(1s) }`).
- Logs progress every 10 attempts if corp refuses to go public.
- Logs "issued dividends" after `issue_dividends()`.

`update` (the maintenance cycle) now logs `maintenance cycle | funds
$X | products N/MAX` at the start of each iteration so the user can
see janitor is alive and roughly what state it's in.

`main` logs `=== janitor maintenance cycle N ===` and
`sleeping 10 minutes before next maintenance cycle` around each
cycle, so the user can see the 10-min sleep boundaries clearly
(was previously just `await ns.sleep(10 * wait_t.MINUTE)` with no
log — user saw silence for 10 minutes between cycle logs and had
no way to tell if it was the sleep or a hang).

### `lib/corporation/util.js::hire_advert_frugal`

Same funds-starvation fix:
```js
while (!org.hire_advert(div)) {       // spins forever if cost > funds
    await ns.sleep(wait_t.SECOND);
}
```
→ bounded by `MAX_ATTEMPTS=60` with a log when giving up.

### Files changed
- `src/corporation/janitor.js`: rewrote
  `product_cycle`/`wait_product`/`go_public`/`update`/`main`
- `src/lib/corporation/util.js`: `hire_advert_frugal` bounded.

## Session 2026-11-05 — re-run restarted from "Round 4 of product development"

User feedback: "When I run it again it started again from round 4.
DON'T START AGAIN FROM ROUND 4".

### Root cause

`product_cycle`'s skip check is `products.length >= to_number(n)`.
For enhanced rounds this false-signals "still to do" after the
discontinue+create churn:

```
After round 4 (capacity research owned, cap=5):  length=4
After round 5:                                    length=5
After round 6: discontinue → create →              length=5

Re-run state: length=5, cap=5.
- enhanced_product_cycle("four"): has_max_products → discontinue (5→4)
- product_cycle("four"): length(4) >= 4 → skip ✓
- enhanced_product_cycle("five"): has_max_products false → no discontinue
- product_cycle("five"): length(4) >= 5 → FALSE → re-runs round 5!
```

The discontinue step (called for round 4 because the script saw
length=5=cap) drops the product count below the round 5 threshold,
defeating the skip logic.

### Fix: phase marker file

`corp.TOBA` now stores a phase integer (10 → 80) written at every
phase boundary and read at startup to skip phases already done:

| Phase | Phase done                                   |
|-------|----------------------------------------------|
| 10    | setup_division + expand_city + smart_supply   |
| 20    | sell_existing_products                        |
| 30    | investment_offer("three")                     |
| 40    | product_cycle one/two/three                   |
| 50    | investment_offer("four") + research()         |
| 60    | enhanced rounds four/five/six                 |
| 70    | before_going_public (more_research, unlock)  |
| 80    | redistribute_rnd                              |

Re-run reads prior phase, skips all phases below it, then removes
TOBA at the end (preserving existing go.js resume() behavior).

### Files changed

- `src/corporation/tobacco.js::main` rewritten with phase tracking.

## Session 2026-11-05 — drain R&D down to 1, push to production

User clarification: when they said "phân bổ lại nhân sự R&D của
tobacco trước khi quit", they meant **drain** R&D (keep just 1
R&D per office), not maximize it. With all scientific research
already purchased, keeping a large R&D headcount just wastes
salary for zero benefit (no research left to buy, no RP buffer
needed). The freed employees should go back to production roles
(to keep revenue up) for janitor.js's maintenance phase.

### `corporation/tobacco.js::redistribute_rnd` (rewritten)

Two-pass reassignment per office:

- **Pass 1**: set R&D to 1 (releasing everyone else into Unassigned
  via `setJobAssignment(div, ct, "Research & Development", 1)`).
- **Pass 2**: fill Operations / Engineer / Management / Business
  up to per-office targets (absorbing from Unassigned).

Targets (sums need not match `numEmployees` — leftover stays in
Unassigned, which is harmless):

| Office       | Operations | Engineer | Management | Business | R&D |
|--------------|-----------|----------|-----------|---------|-----|
| Aevum (dev)  | 10        | 30       | 10        | 5       | 1   |
| Other cities | 30        | 10       | 5         | 10      | 1   |

Aevum is Engineer-heavy to maximize
`prodMult = (engrProd^0.34 + opProd^0.2) * mgmtFactor`
(Product.ts:121) when the next `create_product` starts.  Other
cities are Operations-heavy for factory throughput.

Logs `drained X from R&D, absorbed Y into production` per office.

### Files changed

- `src/corporation/tobacco.js`: `redistribute_rnd` rewritten to
  drain R&D instead of fill it.

## Outstanding ideas (not yet implemented)

## Session 2026-11-05 — `hire_employees` infinite loop on stage 5 hiring

User feedback: "Script đã dừng ở Round 5 of hiring" — script hung
silently at that log line.

### Root cause

`hire_employees` (tobacco.js:508) called `new_hire(..., bool.WAIT)`
for every role hire.  `new_hire` (util.js:450) has the same
funds-starvation infinite loop pattern that was already fixed in
`prep.js::upgrade_round_one`, `tobacco.js::upgrade`, and
`util.js::more_unlock_upgrade`:

```js
if (org.is_at_capacity(div, ct)) {
    success = org.upgrade_office(div, ct, howmany);
    if (!success && wait) {
        while (!org.upgrade_office(...)) {     // ← infinite loop, no log
            await ns.sleep(corp_t.TICK);
        }
    }
}
success = org.new_hire(div, ct, role);
if (!success && wait) {
    while (!org.new_hire(...)) {                // ← infinite loop, no log
        await ns.sleep(corp_t.TICK);
    }
}
```

Stage 5 hiring targets are large (Aevum wants 19 Business + 30
Engineer + 24 Management + 29 Operations + 18 R&D = 120 employees).
Default office size is small (5-10), so reaching stage 5 requires
many `upgrade_office` calls. Each upgrade costs exponentially more
than the previous (OfficeSpace.ts:230 — `cost = initial * size^1.7`
roughly). With $82B in funds, the corp could afford maybe 5-10
upgrades per office, then `upgrade_office` returned FAILURE
silently, `has_unlock_upgrade` stayed false, and the `while`
loop spun forever emitting no log.

### `corporation/tobacco.js::hire_employees`

Switched all `new_hire` calls from `bool.WAIT` to `bool.NO_WAIT`.
With `NO_WAIT`, `new_hire` returns immediately when
`upgrade_office` or `hireEmployee` fails — no infinite loop. Then
the function tracks `hiredTotal` / `skippedTotal` per round and
logs a summary at the end:

```
Tobacco: hired 12, skipped 38 (insufficient funds or office
capacity) for round 5
```

This means the corp proceeds with a smaller headcount than the
stage 5 targets specify — slower product development, but the
script does not hang. janitor.js will continue topping up
employees + office sizes over time as profit accumulates.

Also restructured the loop to use a `roleMap` array of
`{key, job, counter}` triples (replacing the 7 separate
`for (let i = org.num_X(...); i < target_X; i++)` loops that
were duplicated), making the function shorter and the
hire/skip accounting centralized.

### Files changed

- `src/corporation/tobacco.js`: `hire_employees` rewritten.

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
