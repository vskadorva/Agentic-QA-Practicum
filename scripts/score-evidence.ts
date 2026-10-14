import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Side = 'drift' | 'bug';

type EvidenceItem = {
  id: string;
  kind: string;
  artifact: string;
  line?: number;
  excerpt: string;
};

type EvidenceFile = {
  test: { file: string; title: string };
  items: EvidenceItem[];
};

type RubricRequired = {
  id: string;
  kind: string;
  whenSide?: Side;
};

type RubricWeighted = {
  id: string;
  kind: string;
  side: Side | null;
  weight: number;
  oracle?: boolean;
};

type Rubric = {
  required: RubricRequired[];
  weighted: RubricWeighted[];
  thresholds: { act: number; escalate: number };
};

type DecisionName = 'act' | 'escalate' | 'inconclusive';

type ScoreResult = {
  decisionId: string;
  decision: DecisionName;
  side: Side | null;
  score: number;
  oracle: boolean;
  verified: string[];
  missing: string[];
  contradictions: string[];
  rule: string;
  allowedActions: string[];
};

const FORBIDDEN_KEYS = new Set(['score', 'confidence', 'weight']);
const GIT_TRACKED_PREFIXES = ['tests/', 'pages/', 'features/'];

function findRepoRoot(startDir: string): string {
  let dir = startDir;
  for (;;) {
    if (existsSync(path.join(dir, 'package.json'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      return startDir;
    }
    dir = parent;
  }
}

function loadRubric(repoRoot: string): Rubric {
  const raw = readFileSync(
    path.join(repoRoot, 'config/evidence-rubric.json'),
    'utf8',
  );
  return JSON.parse(raw) as Rubric;
}

function decisionIdFromEvidenceFile(evidencePath: string): string {
  const bytes = readFileSync(evidencePath);
  return createHash('sha256').update(bytes).digest('hex').slice(0, 12);
}

function hasForbiddenScoringField(value: unknown): boolean {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  if (Array.isArray(value)) {
    return value.some((entry) => hasForbiddenScoringField(entry));
  }
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key)) {
      return true;
    }
    if (hasForbiddenScoringField(nested)) {
      return true;
    }
  }
  return false;
}

function weightedById(rubric: Rubric): Map<string, RubricWeighted> {
  return new Map(rubric.weighted.map((entry) => [entry.id, entry]));
}

function usesGitTrackedCheck(artifact: string, contentRoot: string): boolean {
  const normalized = artifact.replace(/\\/g, '/');
  if (!GIT_TRACKED_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return false;
  }
  return contentRoot === findRepoRoot(contentRoot);
}

function readArtifactLines(
  artifact: string,
  contentRoot: string,
  useGit: boolean,
): string[] | null {
  const normalized = artifact.replace(/\\/g, '/');
  if (useGit) {
    try {
      const output = execFileSync('git', ['show', `HEAD:${normalized}`], {
        cwd: contentRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      return output.split(/\r?\n/);
    } catch {
      return null;
    }
  }
  const fullPath = path.join(contentRoot, artifact);
  if (!existsSync(fullPath)) {
    return null;
  }
  return readFileSync(fullPath, 'utf8').split(/\r?\n/);
}

function excerptValid(excerpt: string): boolean {
  return excerpt.length >= 8;
}

function lineContainsExcerpt(line: string, excerpt: string): boolean {
  return line.includes(excerpt);
}

function verifyArtifactItem(
  item: EvidenceItem,
  contentRoot: string,
  skipGit: boolean,
): boolean {
  if (!excerptValid(item.excerpt)) {
    return false;
  }
  if (item.id === 'R4') {
    return false;
  }
  const normalized = item.artifact.replace(/\\/g, '/');
  const useGit =
    !skipGit && usesGitTrackedCheck(normalized, contentRoot);
  const lines = readArtifactLines(normalized, contentRoot, useGit);
  if (lines === null) {
    return false;
  }
  if (item.line === undefined) {
    return false;
  }
  if (item.line < 1 || item.line > lines.length) {
    return false;
  }
  return lineContainsExcerpt(lines[item.line - 1] ?? '', item.excerpt);
}

type PlaywrightJsonReport = {
  suites?: PlaywrightSuite[];
  errors?: { message?: string }[];
};

type PlaywrightSuite = {
  suites?: PlaywrightSuite[];
  specs?: PlaywrightSpec[];
};

type PlaywrightSpec = {
  tests?: PlaywrightTest[];
};

type PlaywrightTest = {
  results?: PlaywrightResult[];
};

type PlaywrightResult = {
  status?: string;
  errors?: { message?: string }[];
};

function collectResults(
  suite: PlaywrightSuite,
  out: PlaywrightResult[],
): void {
  for (const nested of suite.suites ?? []) {
    collectResults(nested, out);
  }
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      for (const result of test.results ?? []) {
        out.push(result);
      }
    }
  }
}

function parsePlaywrightReport(reportPath: string): {
  passed: boolean;
  firstErrorLine: string | null;
} {
  const raw = readFileSync(reportPath, 'utf8');
  const report = JSON.parse(raw) as PlaywrightJsonReport;
  const results: PlaywrightResult[] = [];
  for (const suite of report.suites ?? []) {
    collectResults(suite, results);
  }
  const failed = results.filter((r) => r.status === 'failed' || r.status === 'timedOut');
  if (failed.length === 0) {
    const topErrors = report.errors ?? [];
    if (topErrors.length === 0) {
      return { passed: true, firstErrorLine: null };
    }
    const message = topErrors[0]?.message ?? '';
    const firstLine = message.split(/\r?\n/)[0]?.trim() ?? '';
    return { passed: false, firstErrorLine: firstLine || null };
  }
  const message = failed[0]?.errors?.[0]?.message ?? '';
  const firstLine = message.split(/\r?\n/)[0]?.trim() ?? '';
  return { passed: false, firstErrorLine: firstLine || null };
}

function rerunReportPath(workRoot: string, decisionId: string): string {
  return path.join(workRoot, '.test-artifacts/reruns', `${decisionId}.json`);
}

function runPlaywrightRerun(
  repoRoot: string,
  testFile: string,
  title: string,
  decisionId: string,
  workRoot: string,
): string {
  const outPath = rerunReportPath(workRoot, decisionId);
  mkdirSync(path.dirname(outPath), { recursive: true });
  const result = spawnSync(
    'npx',
    ['playwright', 'test', testFile, '-g', title, '--reporter=json'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    },
  );
  const stdout = result.stdout ?? '';
  writeFileSync(outPath, stdout.length > 0 ? stdout : '{}', 'utf8');
  return outPath;
}

function driftItemsPresent(items: EvidenceItem[]): boolean {
  return items.some((item) => /^D\d$/.test(item.id));
}

function requiredIds(rubric: Rubric, items: EvidenceItem[]): string[] {
  const ids = rubric.required
    .filter((req) => req.whenSide !== 'drift')
    .map((req) => req.id);
  if (driftItemsPresent(items)) {
    ids.push('R3');
  }
  return ids;
}

function allowedActionsFor(decision: DecisionName, side: Side | null): string[] {
  if (decision === 'act' && side === 'drift') {
    return ['self-heal'];
  }
  if (decision === 'act' && side === 'bug') {
    return ['bug-report'];
  }
  if (decision === 'escalate') {
    return ['human-review'];
  }
  return [];
}

function writeDecisionOutput(
  repoRoot: string,
  decisionId: string,
  result: ScoreResult,
): void {
  const outDir = path.join(repoRoot, '.test-artifacts/decisions');
  mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${decisionId}.json`);
  writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
}

function buildInconclusive(
  decisionId: string,
  rule: string,
  partial: Partial<ScoreResult> = {},
): ScoreResult {
  return {
    decisionId,
    decision: 'inconclusive',
    side: null,
    score: 0,
    oracle: false,
    verified: partial.verified ?? [],
    missing: partial.missing ?? [],
    contradictions: partial.contradictions ?? [],
    rule,
    allowedActions: [],
  };
}

function scoreEvidence(
  evidencePath: string,
  options: { verifyOnly: boolean; root?: string },
): ScoreResult {
  const repoRoot = findRepoRoot(process.cwd());
  const rubric = loadRubric(repoRoot);
  const weights = weightedById(rubric);
  const contentRoot = options.root
    ? path.resolve(options.root)
    : repoRoot;
  const workRoot = options.root ? path.resolve(options.root) : repoRoot;
  const decisionId = decisionIdFromEvidenceFile(evidencePath);
  const evidence = JSON.parse(
    readFileSync(evidencePath, 'utf8'),
  ) as EvidenceFile;

  if (hasForbiddenScoringField(evidence)) {
    return buildInconclusive(decisionId, 'rule-1-model-score-field');
  }

  const itemById = new Map(evidence.items.map((item) => [item.id, item]));
  const required = requiredIds(rubric, evidence.items);
  const missing: string[] = [];
  for (const id of required) {
    if (!itemById.has(id)) {
      missing.push(id);
    }
  }
  if (missing.length > 0) {
    return buildInconclusive(decisionId, 'rule-2-required-missing', { missing });
  }

  const verified: string[] = [];
  const unverifiedRequired: string[] = [];

  for (const item of evidence.items) {
    if (item.id === 'R4') {
      continue;
    }
    if (/^[RDBN]/.test(item.id) || item.id === 'N') {
      const ok = verifyArtifactItem(item, contentRoot, options.root !== undefined);
      if (ok) {
        verified.push(item.id);
      } else if (required.includes(item.id)) {
        unverifiedRequired.push(item.id);
      }
    }
  }

  const r1 = itemById.get('R1');
  const r4 = itemById.get('R4');
  let rerunPassed = false;
  let r4Verified = false;

  if (r4 && r1) {
    let reportPath: string;
    if (options.verifyOnly) {
      reportPath = rerunReportPath(workRoot, decisionId);
    } else {
      reportPath = runPlaywrightRerun(
        repoRoot,
        evidence.test.file,
        evidence.test.title,
        decisionId,
        repoRoot,
      );
    }
    if (!existsSync(reportPath)) {
      unverifiedRequired.push('R4');
    } else {
      const rerun = parsePlaywrightReport(reportPath);
      if (rerun.passed) {
        rerunPassed = true;
      } else if (
        rerun.firstErrorLine &&
        rerun.firstErrorLine.includes(r1.excerpt)
      ) {
        r4Verified = true;
        verified.push('R4');
      } else {
        unverifiedRequired.push('R4');
      }
    }
  }

  if (rerunPassed) {
    return buildInconclusive(decisionId, 'rule-3-flaky-rerun-passed', {
      verified,
      missing,
    });
  }

  if (unverifiedRequired.length > 0) {
    return buildInconclusive(decisionId, 'rule-2-required-unverified', {
      verified,
      missing,
      contradictions: [],
    });
  }

  const verifiedDrift = evidence.items.filter(
    (item) =>
      verified.includes(item.id) &&
      weights.get(item.id)?.side === 'drift',
  );
  const verifiedBug = evidence.items.filter(
    (item) =>
      verified.includes(item.id) && weights.get(item.id)?.side === 'bug',
  );

  if (verifiedDrift.length > 0 && verifiedBug.length > 0) {
    return buildInconclusive(decisionId, 'rule-4-side-contradiction', {
      verified,
      missing,
      contradictions: [
        ...verifiedDrift.map((i) => i.id),
        ...verifiedBug.map((i) => i.id),
      ],
    });
  }

  const side: Side | null =
    verifiedDrift.length > 0
      ? 'drift'
      : verifiedBug.length > 0
        ? 'bug'
        : null;

  let score = 0;
  let oracle = false;
  for (const item of evidence.items) {
    if (!verified.includes(item.id)) {
      continue;
    }
    const weightEntry = weights.get(item.id);
    if (!weightEntry || weightEntry.side !== side) {
      continue;
    }
    score += weightEntry.weight;
    if (weightEntry.oracle) {
      oracle = true;
    }
  }

  if (score === 0 || side === null) {
    return buildInconclusive(decisionId, 'rule-5-zero-score', {
      verified,
      missing,
    });
  }

  const { act, escalate } = rubric.thresholds;
  if (score >= act && oracle) {
    return {
      decisionId,
      decision: 'act',
      side,
      score,
      oracle,
      verified,
      missing,
      contradictions: [],
      rule: 'rule-6-act',
      allowedActions: allowedActionsFor('act', side),
    };
  }
  if (score >= escalate) {
    return {
      decisionId,
      decision: 'escalate',
      side,
      score,
      oracle,
      verified,
      missing,
      contradictions: [],
      rule: 'rule-7-escalate',
      allowedActions: allowedActionsFor('escalate', side),
    };
  }

  return buildInconclusive(decisionId, 'rule-8-below-escalate', {
    verified,
    missing,
  });
}

function parseArgs(argv: string[]): {
  evidencePath: string;
  verifyOnly: boolean;
  root?: string;
} {
  const positional: string[] = [];
  let verifyOnly = false;
  let root: string | undefined;
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--verify-only') {
      verifyOnly = true;
      continue;
    }
    if (arg === '--root') {
      root = argv[i + 1];
      i += 1;
      continue;
    }
    positional.push(arg);
  }
  if (positional.length !== 1) {
    console.error(
      'Usage: npx tsx scripts/score-evidence.ts <evidence.json> [--verify-only] [--root <dir>]',
    );
    process.exit(1);
  }
  return { evidencePath: positional[0], verifyOnly, root };
}

function main(): void {
  const args = parseArgs(process.argv);
  const repoRoot = findRepoRoot(process.cwd());
  const result = scoreEvidence(args.evidencePath, {
    verifyOnly: args.verifyOnly,
    root: args.root,
  });
  writeDecisionOutput(repoRoot, result.decisionId, result);
  console.log(JSON.stringify(result));
}

const modulePath = fileURLToPath(import.meta.url);
const invokedPath = process.argv[1]
  ? path.resolve(process.argv[1])
  : '';
if (invokedPath === modulePath) {
  main();
}

export { scoreEvidence, decisionIdFromEvidenceFile, parsePlaywrightReport };
