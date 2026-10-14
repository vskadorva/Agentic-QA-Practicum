import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, test } from 'node:test';

import { scoreEvidence } from './score-evidence.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixturesRoot = path.join(repoRoot, 'scripts/evidence-fixtures');

function scoreCase(caseName: string) {
  const root = path.join(fixturesRoot, caseName);
  const evidencePath = path.join(root, 'evidence.json');
  return scoreEvidence(evidencePath, { verifyOnly: true, root });
}

describe('score-evidence fixtures', () => {
  test('min-act-drift: R1–R4, D1 + D2 → drift 60, act (rule 6)', () => {
    const result = scoreCase('min-act-drift');
    assert.equal(result.decision, 'act');
    assert.equal(result.side, 'drift');
    assert.equal(result.score, 60);
    assert.equal(result.oracle, true);
    assert.equal(result.rule, 'rule-6-act');
  });

  test('min-act-bug: R1, R2, R4, B1 + B3 → bug 60, act (rule 6)', () => {
    const result = scoreCase('min-act-bug');
    assert.equal(result.decision, 'act');
    assert.equal(result.side, 'bug');
    assert.equal(result.score, 60);
    assert.equal(result.oracle, true);
    assert.equal(result.rule, 'rule-6-act');
  });

  test('min-escalate: R1–R4, D1 → drift 40, escalate (rule 7)', () => {
    const result = scoreCase('min-escalate');
    assert.equal(result.decision, 'escalate');
    assert.equal(result.side, 'drift');
    assert.equal(result.score, 40);
    assert.equal(result.rule, 'rule-7-escalate');
  });

  test('missing-required: no R4, D1 + D4 → inconclusive (rule 2)', () => {
    const result = scoreCase('missing-required');
    assert.equal(result.decision, 'inconclusive');
    assert.ok(result.rule.startsWith('rule-2'));
    assert.ok(result.missing.includes('R4'));
  });

  test('contradiction: R1–R4, D1 + B2 → inconclusive (rule 4)', () => {
    const result = scoreCase('contradiction');
    assert.equal(result.decision, 'inconclusive');
    assert.equal(result.rule, 'rule-4-side-contradiction');
  });

  test('neutral-oracle: R1–R4, N + D2 + D3 → drift 35, no oracle, escalate (rule 7)', () => {
    const result = scoreCase('neutral-oracle');
    assert.equal(result.decision, 'escalate');
    assert.equal(result.side, 'drift');
    assert.equal(result.score, 35);
    assert.equal(result.oracle, false);
    assert.equal(result.rule, 'rule-7-escalate');
  });

  test('flaky: the saved re-run passed → inconclusive (rule 3)', () => {
    const result = scoreCase('flaky');
    assert.equal(result.decision, 'inconclusive');
    assert.equal(result.rule, 'rule-3-flaky-rerun-passed');
  });

  test('model-score: the evidence has "confidence": 0.9 → inconclusive (rule 1)', () => {
    const result = scoreCase('model-score');
    assert.equal(result.decision, 'inconclusive');
    assert.equal(result.rule, 'rule-1-model-score-field');
  });
});
