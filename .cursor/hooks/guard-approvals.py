#!/usr/bin/env python3
"""preToolUse (Write): block agent writes under .test-artifacts/approvals/."""

from __future__ import annotations

import json
import sys
from typing import Any

from evidence_gate import (
    APPROVALS_PATH,
    allow,
    normalize_rel_path,
    repo_root_from_payload,
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
    if not APPROVALS_PATH.search(rel):
        allow()

    message = (
        "Evidence gate blocked (approvals): agents cannot write "
        f".test-artifacts/approvals/ ({rel}). Approval files are created by a "
        "human, by hand."
    )
    print(
        json.dumps(
            {
                "permission": "deny",
                "user_message": message,
                "agent_message": message,
            }
        )
    )
    print(message, file=sys.stderr)
    sys.exit(2)


if __name__ == "__main__":
    main()
