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
