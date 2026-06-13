# Oddsmith

*A prediction oracle that lives entirely on-chain. You write a forecast and the exact criteria that settle it; when the outcome is knowable, anyone submits evidence and an AI oracle rules YES, NO, or INVALID with a confidence reading, re-derived by every GenLayer validator before it is recorded. No stake, no custody, network fees only.*

It is sitting live at [warnedwarn.github.io/oddsmith](https://warnedwarn.github.io/oddsmith/), reading and writing to contract [`0xCdefeC7a…9eBf471`](https://explorer-bradbury.genlayer.com/address/0xCdefeC7a47AC26A10083E626e22d5e9d49eBf471) on GenLayer Bradbury, which was born in [this transaction](https://explorer-bradbury.genlayer.com/tx/0x2eba9b8c2fae10f78834f2091dd1c49d579497980fcea29e7156c1f472a9e7ce). Read it as a set of questions.

---

**Why does a prediction oracle need a blockchain at all?**

Because an oracle is only as trustworthy as whatever resolves it, and a single server resolving outcomes is just a black box you have to take on faith. Oddsmith moves the resolution under consensus: a leader validator produces the ruling, every other validator independently re-derives it, and only a result they agree on is written. That reproducible, adversarial judgment over subjective evidence is the part GenLayer makes possible and an ordinary backend cannot. Nothing is hosted but a static page; the contract is the whole system.

**What exactly is "the contract"? Where does state live?**

The contract *is* the backend. Every forecast, its criteria, the ruling, the confidence reading, and the event ledger live in contract storage under consensus. Records are JSON in a `TreeMap[str, str]` keyed by id, with a parallel `DynArray[str]` for insertion-ordered paging and `u256` counters (`total_forecasts`, `total_resolved`, `total_yes`) so statistics never require a scan. The runner is pinned to `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`. Turn the website off and the oracle still stands.

**What can I actually call?**

Two writes and four reads.

- `open_forecast(claim, criteria, resolve_after) -> id` validates lengths, stores an OPEN record, logs the event, returns the id. Deterministic, no AI.
- `resolve_forecast(forecast_id, evidence)` is the AI write: it guards (exists, still open, evidence sized), runs one consensus round, applies a backstop, flips the record to RESOLVED, and appends to the ledger.
- `get_forecasts(start)`, `get_forecast(id)`, `get_ledger(start)`, and `get_stats()` are the reads, each paged at twenty.

**How is the ruling reached, step by step?**

Inside `_adjudicate`: the leader feeds the claim, criteria, and evidence into an injection-resistant prompt and returns `{ruling, confidence, rationale}`, treating all evidence as untrusted data (any attempt to rewrite the rules or impersonate the system is forced to INVALID, confidence 0). Then a custom validator (`gl.vm.run_nondet_unsafe`) has every validator re-run the task. The `ruling` word must match exactly; the `confidence` must agree within tolerance, the larger of 20 points or 20 percent. A mismatch or a wild confidence gap rotates the leader. Error classes are compared so even failures reach consensus.

**Can a confident-looking INVALID slip through?**

No. A prompt can be coaxed; arithmetic cannot. After consensus a deterministic backstop caps INVALID confidence at 40, so a low-trust ruling can never be recorded as near-certain no matter what the model emitted.

**What is the site built from, and why does it look like that?**

Next.js 14 exported to static HTML, TypeScript, Tailwind, Framer Motion, lucide icons, genlayer-js 1.1.8. The visual language is blueprint schematic: a dark navy drafting field with a faint grid, cyan line-work, corner crop marks on every panel, dashed connectors, measurement ticks, and a hero canvas tracing a live probability curve under drifting crosshairs. Chakra Petch over Inter, JetBrains Mono for anything on-chain. It is meant to read like a technical drawing.

**What should I expect while a forecast resolves?**

Reads need no wallet, so the board renders chain state on load behind an error boundary. The resolve flow stages the real consensus lifecycle and previews the leader's draft ruling decoded from the receipt, marked as a draft until sealed. An AI write takes one to five minutes; status is polled via `gen_getTransactionByHash` (no VM execution, so it dodges the read rate limit), board polling is slow and pauses while a write is in flight, and leader rotation reads as progress, never an error.

**How do I run or deploy it myself?**

Lint and test the contract, then build the interface:

```bash
pip install genvm-linter genlayer-test
genvm-lint check contracts/contract.py
gltest tests/integration/ -v -s --network studionet
cd frontend && npm install && npm run build
```

Deploy signs with the key in a repo-root `.env` (template in `.env.example`), not the CLI keychain: `python scripts/deploy.py`, then `scripts/verify_read.py` and `scripts/verify_write.py` prove the read and the full AI write. Ship the static export with `npm run deploy` from `frontend/` (pushes `out/` to `gh-pages` with `--dotfiles`). Need test GEN to try a write? Claim it at [testnet-faucet.genlayer.foundation](https://testnet-faucet.genlayer.foundation/).

**Is this financial advice?**

No. The oracle is an AI ruling under validator consensus on a test network; it evaluates evidence against stated criteria and nothing here is financial advice.
