import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Label = 'drift' | 'bug' | 'ambiguous';

const LABELS: readonly Label[] = ['drift', 'bug', 'ambiguous'];

interface AnswerKeyCase {
  id: string;
  input: string;
  expected: Label;
}

interface Prediction {
  id: string;
  predicted: Label;
  evidence: string;
}

interface RunFile {
  model: string;
  startedAt: string;
  finishedAt: string;
  predictions: Prediction[];
}

function repoRoot(): string {
  return path.dirname(path.dirname(fileURLToPath(import.meta.url)));
}

function isLabel(value: unknown): value is Label {
  return typeof value === 'string' && (LABELS as readonly string[]).includes(value);
}

function isAnswerKeyCase(value: unknown): value is AnswerKeyCase {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === 'string' &&
    typeof row.input === 'string' &&
    isLabel(row.expected)
  );
}

function parseAnswerKey(raw: string, filePath: string): AnswerKeyCase[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid JSON in ${filePath}: ${message}`);
  }
  if (!Array.isArray(parsed)) {
    throw new Error(`Answer key must be a JSON array: ${filePath}`);
  }
  const cases: AnswerKeyCase[] = [];
  for (const entry of parsed) {
    if (!isAnswerKeyCase(entry)) {
      throw new Error(`Invalid answer-key entry in ${filePath}`);
    }
    cases.push(entry);
  }
  return cases;
}

function isPrediction(value: unknown): value is Prediction {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === 'string' &&
    isLabel(row.predicted) &&
    typeof row.evidence === 'string'
  );
}

function parseRunFile(raw: string, filePath: string): RunFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid JSON in ${filePath}: ${message}`);
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Run file must be a JSON object: ${filePath}`);
  }
  const row = parsed as Record<string, unknown>;
  if (typeof row.model !== 'string') {
    throw new Error(`Run file missing string "model": ${filePath}`);
  }
  if (typeof row.startedAt !== 'string' || typeof row.finishedAt !== 'string') {
    throw new Error(`Run file missing startedAt/finishedAt: ${filePath}`);
  }
  if (!Array.isArray(row.predictions)) {
    throw new Error(`Run file missing predictions array: ${filePath}`);
  }
  const predictions: Prediction[] = [];
  for (const entry of row.predictions) {
    if (!isPrediction(entry)) {
      throw new Error(`Invalid prediction in ${filePath}`);
    }
    predictions.push(entry);
  }
  return {
    model: row.model,
    startedAt: row.startedAt,
    finishedAt: row.finishedAt,
    predictions,
  };
}

function loadRunFiles(runsDir: string): { path: string; run: RunFile }[] {
  if (!readdirSync(runsDir, { withFileTypes: true }).some((d) => d.isFile())) {
    return [];
  }
  const files = readdirSync(runsDir)
    .filter((name) => name.endsWith('.json'))
    .sort();
  return files.map((name) => {
    const filePath = path.join(runsDir, name);
    const run = parseRunFile(readFileSync(filePath, 'utf8'), filePath);
    return { path: filePath, run };
  });
}

function formatRate(numerator: number, denominator: number): string {
  if (denominator === 0) return 'n/a';
  return `${((numerator / denominator) * 100).toFixed(1)}% (${numerator}/${denominator})`;
}

function main(): void {
  const agent = process.argv[2];
  if (!agent || agent.startsWith('-')) {
    console.error('Usage: npx tsx evals/score.ts <agent>');
    process.exit(1);
  }

  const root = repoRoot();
  const agentDir = path.join(root, 'evals', agent);
  const keyPath = path.join(agentDir, 'answer-key.json');
  const runsDir = path.join(agentDir, 'runs');

  let keyCases: AnswerKeyCase[];
  try {
    keyCases = parseAnswerKey(readFileSync(keyPath, 'utf8'), keyPath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  }

  const expectedById = new Map<string, Label>();
  for (const item of keyCases) {
    expectedById.set(item.id, item.expected);
  }

  const runs = loadRunFiles(runsDir);
  let invalidId = false;

  type ScoredRow = { id: string; expected: Label; predicted: Label; runFile: string };
  const scored: ScoredRow[] = [];

  for (const { path: runPath, run } of runs) {
    const runName = path.relative(root, runPath);
    for (const prediction of run.predictions) {
      const expected = expectedById.get(prediction.id);
      if (expected === undefined) {
        console.error(
          `Unknown case id "${prediction.id}" in ${runName} (not in answer key)`,
        );
        invalidId = true;
        continue;
      }
      scored.push({
        id: prediction.id,
        expected,
        predicted: prediction.predicted,
        runFile: runName,
      });
    }
  }

  if (invalidId) {
    process.exit(1);
  }

  console.log(`Agent: ${agent}`);
  console.log(`Answer key: ${keyCases.length} case(s)`);
  console.log(`Run files: ${runs.length}`);
  console.log(`Scored predictions: ${scored.length}`);
  console.log('');

  let correct = 0;
  for (const row of scored) {
    if (row.predicted === row.expected) correct += 1;
  }
  console.log(`Overall accuracy: ${formatRate(correct, scored.length)}`);
  console.log('');

  console.log('Per-class precision / recall:');
  for (const label of LABELS) {
    let predictedAs = 0;
    let truePositive = 0;
    let expectedAs = 0;
    for (const row of scored) {
      if (row.predicted === label) predictedAs += 1;
      if (row.expected === label) expectedAs += 1;
      if (row.predicted === label && row.expected === label) truePositive += 1;
    }
    console.log(
      `  ${label}: precision ${formatRate(truePositive, predictedAs)}, recall ${formatRate(truePositive, expectedAs)}`,
    );
  }
  console.log('');

  console.log('False positives per class (predicted X, expected ≠ X):');
  for (const label of LABELS) {
    let fp = 0;
    for (const row of scored) {
      if (row.predicted === label && row.expected !== label) fp += 1;
    }
    console.log(`  ${label}: ${fp}`);
  }
  console.log('');

  const predictionsByCase = new Map<string, Label[]>();
  for (const { path: runPath, run } of runs) {
    for (const prediction of run.predictions) {
      if (!expectedById.has(prediction.id)) continue;
      const list = predictionsByCase.get(prediction.id) ?? [];
      list.push(prediction.predicted);
      predictionsByCase.set(prediction.id, list);
    }
  }

  let agreeingCases = 0;
  for (const keyCase of keyCases) {
    const preds = predictionsByCase.get(keyCase.id) ?? [];
    if (preds.length !== runs.length || runs.length === 0) continue;
    const first = preds[0];
    if (preds.every((p) => p === first)) agreeingCases += 1;
  }

  console.log(
    `Cross-run agreement: ${formatRate(agreeingCases, keyCases.length)} (key cases where every run predicted the same class)`,
  );
}

main();
