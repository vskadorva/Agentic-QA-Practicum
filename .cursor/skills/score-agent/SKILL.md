---
name: score-agent
description: Scores an agent against an answer key and appends the result to eval-report.md. Use when the user asks how accurate an agent is, wants to score triage, self-heal, or test generation, or after cases are added to an evals/*/answer-key.json.
---

# Score agent accuracy

Measure classification quality for an agent (e.g. **triage**) against `evals/<agent>/answer-key.json`. **Report only** — do not change tests, POMs, or the answer key unless the user explicitly asks.

## Rule

The agent under test **must not read** `answer-key.json` (or derived labels) during a scoring pass. Only `input` fields from cases the human added may be shown to the agent.

## Workflow

1. **Confirm agent name** — folder `evals/<agent>/` with `answer-key.json` populated by the user (never invent cases or edit the key).
2. **One run pass** — For each case, give the agent only `input` (failure log, diff, ticket excerpt, etc.). Collect `{ id, predicted, evidence }` with `predicted` ∈ `drift` | `bug` | `ambiguous`.
3. **Write run file** — Save under `evals/<agent>/runs/<YYYY-MM-DD>-<n>.json`:

   ```json
   {
     "model": "<model slug used for the agent>",
     "startedAt": "<ISO-8601>",
     "finishedAt": "<ISO-8601>",
     "predictions": [{ "id", "predicted", "evidence" }]
   }
   ```

4. **Repeat** — Default **N = 3** independent passes (new run file each time, increment `<n>`). User may override N.
5. **Score** — From repo root:

   ```bash
   npx tsx evals/score.ts <agent>
   ```

   Non-zero exit means a run referenced an `id` not in the answer key — fix run files before reporting.

6. **Append eval-report** — Add a dated **Agent accuracy** section to `eval-report.md` with:
   - agent name, model(s), run file names, and N
   - overall accuracy, per-class precision/recall, false positives per class, cross-run agreement (copy from `score.ts` output)
   - one line on **how measured** (answer key path, number of cases, no peeking at labels during runs)

## Paths

| Artifact | Location |
| -------- | -------- |
| Answer key | `evals/<agent>/answer-key.json` |
| Run outputs | `evals/<agent>/runs/<date>-<n>.json` |
| Scorer | `evals/score.ts` |
| Overview | `evals/README.md` |

Starter triage key: `evals/triage/answer-key.json` (user-maintained).
