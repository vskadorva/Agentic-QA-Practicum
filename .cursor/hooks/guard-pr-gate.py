#!/usr/bin/env python3
"""beforeShellExecution: gate gh pr create on heal/* branches."""

from __future__ import annotations

import json
import sys
from typing import Any

from evidence_gate import (
    GH_PR_CREATE,
    HEAL_BRANCH,
    allow,
    deny,
    git_branch,
    repo_root_from_payload,
    run_scorer,
    side_allowed,
)


def main() -> None:
    raw = sys.stdin.read()
    if not raw.strip():
        sys.exit(1)
    payload: dict[str, Any] = json.loads(raw)
    command = payload.get("command")
    if not isinstance(command, str) or not GH_PR_CREATE.search(command):
        allow()

    repo_root = repo_root_from_payload(payload)
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
