#!/usr/bin/env python3
"""beforeMCPExecution: gate Atlassian Bug create (issueType Bug)."""

from __future__ import annotations

import json
import sys
from typing import Any

from evidence_gate import (
    allow,
    deny,
    is_jira_bug_create,
    parse_mcp_tool_input,
    repo_root_from_payload,
    run_scorer,
    side_allowed,
)


def main() -> None:
    raw = sys.stdin.read()
    if not raw.strip():
        sys.exit(1)
    payload: dict[str, Any] = json.loads(raw)
    tool_name = payload.get("tool_name")
    if not isinstance(tool_name, str):
        allow()

    tool_input = parse_mcp_tool_input(payload.get("tool_input"))
    if not is_jira_bug_create(tool_name, tool_input):
        allow()

    repo_root = repo_root_from_payload(payload)
    result = run_scorer(repo_root)
    if side_allowed(result, side="bug", repo_root=repo_root):
        allow()
    deny(
        result,
        need="act with side bug, or escalate (bug) with "
        f".test-artifacts/approvals/{result.get('decisionId')}.json",
    )


if __name__ == "__main__":
    main()
