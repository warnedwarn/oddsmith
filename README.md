# Oddsmith

A prediction oracle that lives entirely on-chain. You draft a forecast and write the exact criteria that decide it. When the outcome is knowable, anyone submits evidence and an AI oracle returns one of three rulings, YES, NO, or INVALID, with a confidence reading. That ruling is not one server's opinion: every GenLayer validator re-derives it and they must agree before it is written. No stake, no custody, only network fees.

```
  SPEC SHEET
  ----------------------------------------------------
  network .......... GenLayer Bradbury Testnet (4221)
  contract ......... 0xCdefeC7a47AC26A10083E626e22d5e9d49eBf471
  rulings .......... YES / NO / INVALID  (+ 0-100 confidence)
  writes ........... open_forecast, resolve_forecast
  settlement ....... AI ruling under validator consensus
  deposits ......... none
  ----------------------------------------------------
```

- Live: https://warnedwarn.github.io/oddsmith/
- Contract on explorer: https://explorer-bradbury.genlayer.com/address/0xCdefeC7a47AC26A10083E626e22d5e9d49eBf471
- Deploy tx: https://explorer-bradbury.genlayer.com/tx/0x2eba9b8c2fae10f78834f2091dd1c49d579497980fcea29e7156c1f472a9e7ce

## What makes this need a chain

A prediction market or an oracle is only as trustworthy as the thing resolving it. Hand resolution to one server and you are back to trusting a black box. Oddsmith puts the resolution under consensus: the ruling is produced by a leader, then independently reproduced by every other validator, and only a result they agree on gets recorded. That reproducible, adversarial judgment over subjective evidence is precisely what GenLayer enables and a plain backend cannot.

Consequently there is nothing to host but a static page. The contract is the entire system, every forecast, criterion, ruling, confidence reading, and the event ledger live in contract storage under consensus. The website reads the chain and helps you write to it; switch it off and the oracle still stands.

## How a ruling is reached

The interesting machinery is in `resolve_forecast` and the internal `_adjudicate`:

- **The leader runs the oracle.** A single validator feeds the claim, the criteria, and the submitted evidence into an injection-resistant prompt and returns `{ruling, confidence, rationale}`. The prompt treats all evidence as untrusted data; any attempt to rewrite the rules or impersonate the system is forced to INVALID with confidence 0.
- **Every validator re-derives it.** Using a custom validator function (`gl.vm.run_nondet_unsafe`), each validator runs the same task. The `ruling` word must match exactly. The `confidence` is compared with a tolerance, the larger of 20 points or 20 percent, because honest models rarely agree on the exact number. A ruling mismatch or a wild confidence gap makes validators disagree, which rotates the leader and retries.
- **Errors are classified for consensus.** Deterministic `[EXPECTED]` errors must match exactly; `[TRANSIENT]` errors agree when both sides hit them; LLM or unknown failures force disagreement so bad output never settles.
- **Code has the final say.** After consensus, a deterministic backstop caps INVALID confidence at 40, so a low-trust ruling can never be recorded as near-certain regardless of what the model emitted.

## Storage and the public surface

State is JSON records in a `TreeMap[str, str]` keyed by id, with a parallel `DynArray[str]` for insertion-ordered paging and `u256` counters (`total_forecasts`, `total_resolved`, `total_yes`) so stats never require a scan. Runner pinned to `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`.

Writes:
- `open_forecast(claim, criteria, resolve_after) -> id` validates lengths, stores an OPEN record, logs the event, returns the new id. Deterministic, no AI.
- `resolve_forecast(forecast_id, evidence)` guards (exists, still open, evidence sized), runs one consensus round, applies the backstop, flips the record to RESOLVED, and appends to the ledger. This is the AI write.

Reads (all paged at 20):
- `get_forecasts(start)` ordered list, `get_forecast(id)` one record, `get_ledger(start)` the append-only event log, `get_stats()` the running totals.

## The interface

Next.js 14 exported to static HTML, TypeScript, Tailwind, Framer Motion, lucide icons, genlayer-js 1.1.8.

Visual language is blueprint schematic: a dark navy drafting field with a faint grid, cyan line-work, corner crop marks on every panel, dashed connectors between steps, measurement ticks, and a hero canvas that traces a live probability curve under drifting crosshairs. Display type is Chakra Petch over Inter, with JetBrains Mono for anything on-chain. It is built to read like a technical drawing, deliberately unlike the other projects in the registry.

Notable behavior:
- Reads need no wallet; the board renders chain state on load, wrapped so a failed RPC degrades one section instead of the page.
- Two write paths share one modal: drafting a forecast (deterministic, fast) and resolving one (the AI write). The resolve flow stages the real consensus lifecycle and previews the leader's draft ruling decoded from the receipt, marked as a draft until sealed.
- Status polling uses `gen_getTransactionByHash` (no VM execution, dodges the read rate limit); board polling is slow and pauses while a write is in flight.
- Timeouts read as leader rotation, never errors; only ACCEPTED, FINALIZED, UNDETERMINED, and CANCELED end the wait.

## Build and run

```bash
# contract
pip install genvm-linter genlayer-test
genvm-lint check contracts/contract.py
gltest tests/integration/ -v -s --network studionet

# interface
cd frontend && npm install
npm run dev      # localhost:3000
npm run build    # static export into frontend/out
```

Deployment uses the signing key in a repo-root `.env` (template in `.env.example`), not the CLI keychain:

```bash
python scripts/deploy.py        # deploy and verify the receipt
python scripts/verify_read.py   # read gate
python scripts/verify_write.py  # open + AI resolve, end to end
```

Ship the interface to GitHub Pages from `frontend/`:

```bash
npm run deploy   # builds, pushes out/ to gh-pages with --dotfiles
```

## Coordinates

| | |
| --- | --- |
| Live | https://warnedwarn.github.io/oddsmith/ |
| Contract | https://explorer-bradbury.genlayer.com/address/0xCdefeC7a47AC26A10083E626e22d5e9d49eBf471 |
| Deploy tx | https://explorer-bradbury.genlayer.com/tx/0x2eba9b8c2fae10f78834f2091dd1c49d579497980fcea29e7156c1f472a9e7ce |
| Test GEN | https://testnet-faucet.genlayer.foundation/ |

The oracle is an AI ruling under validator consensus on a test network. It evaluates evidence against stated criteria and is not financial advice.
