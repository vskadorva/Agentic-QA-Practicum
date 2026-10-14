# Agent evals

Add cases to `evals/<agent>/answer-key.json` (`{ "id", "input", "expected" }`, `expected` ∈ `drift` | `bug` | `ambiguous`).
Run the agent on each `input` without reading the answer key; save `evals/<agent>/runs/<date>-<n>.json` with `predictions`.
Score with `npx tsx evals/score.ts <agent>` (loads the key and every run file for that agent).
Prints per-class precision/recall, overall accuracy, false positives per class, and cross-run agreement.
Use the **score-agent** skill to repeat runs (default 3), score, and append **Agent accuracy** to `eval-report.md`.
