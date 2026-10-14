#!/usr/bin/env python3
"""preToolUse (Write): gate pages/ edits on heal/* branches."""

from __future__ import annotations

import json
import sys
from typing import Any

from evidence_gate import (
    HEAL_BRANCH,
    PAGES_PATH,
    allow,
    deny,
    git_branch,
    normalize_rel_path,
    repo_root_from_payload,
    run_scorer,
    side_allowed,
    write_target_path,
)


def main() -> None:
    raw = sys.stdin.read()
    if not raw.strip():
        sys.exit(1)
    payload: dict[str, Any] = json.loads(raw)
    if payload.get("tool_name") != "Write":
        allow()

    tool_input = payload.get("tool_input")
    if not isinstance(tool_input, dict):
        allow()

    repo_root = repo_root_from_payload(payload)
    rel = normalize_rel_path(repo_root, write_target_path(tool_input))
    if not PAGES_PATH.search(rel):
        allow()

    branch = git_branch(repo_root)
    if not HEAL_BRANCH.match(branch):
        allow()

    result = run_scorer(repo_root)
    if side_allowed(result, side="drift", repo_root=repo_root):
        allow()
    deny(
        result,
        need="act with side drift, or escalate (drift) with "
        f".test-artifacts/approvals/{result.get('decisionId')}.json",
    )


if __name__ == "__main__":
    main()
