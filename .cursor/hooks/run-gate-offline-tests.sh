#!/usr/bin/env bash
# Offline hook checks: one allow + one deny (no live Jira).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
HOOKS=".cursor/hooks"
FIX="scripts/evidence-fixtures"
PACK=".test-artifacts/evidence-pack"
mkdir -p "$PACK/logs" "$PACK/tests" "$PACK/pages" "$PACK/evidence" \
  .test-artifacts/evidence .test-artifacts/reruns

stage_fixture() {
  local case="$1"
  rm -rf "$PACK/pages" "$PACK/evidence"
  mkdir -p "$PACK/pages" "$PACK/evidence"
  cp "$FIX/$case/logs/failure.log" "$PACK/logs/failure.log"
  cp "$FIX/$case/tests/a.spec.ts" "$PACK/tests/a.spec.ts"
  cp -r "$FIX/$case/pages/." "$PACK/pages/" 2>/dev/null || true
  cp -r "$FIX/$case/evidence/." "$PACK/evidence/" 2>/dev/null || true
  python3 - <<PY
import json, pathlib
root = pathlib.Path("$ROOT")
data = json.loads(pathlib.Path("$FIX/$case/evidence.json").read_text())
for item in data.get("items", []):
    art = item.get("artifact", "")
    if art.startswith(("logs/", "tests/", "pages/", "evidence/")):
        item["artifact"] = f".test-artifacts/evidence-pack/{art}"
(root / ".test-artifacts/evidence/current.json").write_text(json.dumps(data, indent=2) + "\n")
PY
  decision_id="$(python3 -c "import hashlib,pathlib; b=pathlib.Path('.test-artifacts/evidence/current.json').read_bytes(); print(hashlib.sha256(b).hexdigest()[:12])")"
  cp "$FIX/$case/.test-artifacts/reruns/"*.json ".test-artifacts/reruns/${decision_id}.json"
}

branch="$(git rev-parse --abbrev-ref HEAD)"
if [[ ! "$branch" =~ ^heal/ ]]; then
  git checkout -B heal/offline-gate-test >/dev/null
  trap 'git checkout - >/dev/null 2>&1 || true' EXIT
fi

pre_write() {
  local expect="$1"
  local payload
  payload="$(python3 -c "import json,os; print(json.dumps({'hook_event_name':'preToolUse','tool_name':'Write','tool_input':{'path':os.path.abspath('pages/login.page.ts')},'workspace_roots':['$ROOT']}))")"
  set +e
  out="$(printf '%s' "$payload" | python3 "$HOOKS/guard-heal-gate.py" 2>&1)"
  code=$?
  set -e
  echo "=== guard-heal-gate expect=$expect exit=$code ==="
  echo "$out"
  [[ "$expect" == allow && "$code" -eq 0 ]] || [[ "$expect" == deny && "$code" -eq 2 ]]
}

shell_pr() {
  local expect="$1"
  payload="$(python3 -c "import json; print(json.dumps({'hook_event_name':'beforeShellExecution','command':'gh pr create --title test','workspace_roots':['$ROOT']}))")"
  set +e
  out="$(printf '%s' "$payload" | python3 "$HOOKS/guard-pr-gate.py" 2>&1)"
  code=$?
  set -e
  echo "=== guard-pr-gate expect=$expect exit=$code ==="
  echo "$out"
  [[ "$expect" == allow && "$code" -eq 0 ]] || [[ "$expect" == deny && "$code" -eq 2 ]]
}

mcp_bug() {
  local expect="$1"
  payload="$(python3 -c "import json; print(json.dumps({'hook_event_name':'beforeMCPExecution','tool_name':'createJiraIssue','tool_input':json.dumps({'issueType':'Bug','projectKey':'AQPBT','summary':'x','cloudId':'x'}),'workspace_roots':['$ROOT']}))")"
  set +e
  out="$(printf '%s' "$payload" | python3 "$HOOKS/guard-jira-bug-gate.py" 2>&1)"
  code=$?
  set -e
  echo "=== guard-jira-bug-gate expect=$expect exit=$code ==="
  echo "$out"
  [[ "$expect" == allow && "$code" -eq 0 ]] || [[ "$expect" == deny && "$code" -eq 2 ]]
}

stage_fixture min-act-drift
pre_write allow
shell_pr allow
mcp_bug deny

stage_fixture min-act-bug
pre_write deny
shell_pr deny
mcp_bug allow

payload="$(python3 -c "import json,os; print(json.dumps({'hook_event_name':'preToolUse','tool_name':'Write','tool_input':{'path':os.path.abspath('.test-artifacts/approvals/fake.json')},'workspace_roots':['$ROOT']}))")"
set +e
out="$(printf '%s' "$payload" | python3 "$HOOKS/guard-approvals.py" 2>&1)"
code=$?
set -e
echo "=== guard-approvals expect=deny exit=$code ==="
echo "$out"
[[ "$code" -eq 2 ]]

echo "All offline gate checks passed."
