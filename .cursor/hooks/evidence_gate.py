#!/usr/bin/env python3
"""Run score-evidence and evaluate heal / bug / approval gate rules."""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

EVIDENCE_REL = Path(".test-artifacts/evidence/current.json")
APPROVALS_DIR = Path(".test-artifacts/approvals")
HEAL_BRANCH = re.compile(r"^heal/")
PAGES_PATH = re.compile(r"(^|/)pages/")
APPROVALS_PATH = re.compile(r"(^|/)\.test-artifacts/approvals/")
GH_PR_CREATE = re.compile(r"\bgh\s+pr\s+create\b")
JIRA_BUG_TYPE = "Bug"
JIRA_CREATE_TOOLS = frozenset({"createJiraIssue", "create-issue"})


def repo_root_from_payload(payload: dict[str, Any]) -> Path:
    roots = payload.get("workspace_roots")
    if isinstance(roots, list) and roots:
        first = roots[0]
        if isinstance(first, str) and first.strip():
            return Path(first).resolve()
    return Path.cwd().resolve()


def git_branch(repo_root: Path) -> str:
    try:
        out = subprocess.check_output(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=repo_root,
            stderr=subprocess.DEVNULL,
            text=True,
        )
        return out.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return ""


def run_scorer(repo_root: Path) -> dict[str, Any]:
    evidence_path = repo_root / EVIDENCE_REL
    if not evidence_path.is_file():
        return {
            "decisionId": "",
            "decision": "inconclusive",
            "side": None,
            "score": 0,
            "oracle": False,
            "verified": [],
            "missing": ["evidence"],
            "contradictions": [],
            "rule": "gate-no-evidence-file",
            "allowedActions": [],
        }
    cmd = [
        "npx",
        "tsx",
        "scripts/score-evidence.ts",
        "--verify-only",
        str(EVIDENCE_REL),
    ]
    proc = subprocess.run(
        cmd,
        cwd=repo_root,
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        return {
            "decisionId": "",
            "decision": "inconclusive",
            "side": None,
            "score": 0,
            "oracle": False,
            "verified": [],
            "missing": ["scorer-failed"],
            "contradictions": [],
            "rule": "gate-scorer-exit-nonzero",
            "allowedActions": [],
            "stderr": proc.stderr.strip(),
        }
    line = proc.stdout.strip().splitlines()[-1] if proc.stdout.strip() else ""
    try:
        parsed = json.loads(line)
    except json.JSONDecodeError:
        return {
            "decisionId": "",
            "decision": "inconclusive",
            "side": None,
            "score": 0,
            "oracle": False,
            "verified": [],
            "missing": ["scorer-json"],
            "contradictions": [],
            "rule": "gate-scorer-invalid-json",
            "allowedActions": [],
        }
    if not isinstance(parsed, dict):
        raise TypeError("scorer output must be an object")
    return parsed


def has_human_approval(repo_root: Path, decision_id: str) -> bool:
    if not decision_id:
        return False
    path = repo_root / APPROVALS_DIR / f"{decision_id}.json"
    return path.is_file()


def side_allowed(
    result: dict[str, Any],
    *,
    side: str,
    repo_root: Path,
) -> bool:
    decision = result.get("decision")
    result_side = result.get("side")
    decision_id = str(result.get("decisionId") or "")
    if decision == "act" and result_side == side:
        return True
    if (
        decision == "escalate"
        and result_side == side
        and has_human_approval(repo_root, decision_id)
    ):
        return True
    return False


def denial_message(result: dict[str, Any], *, need: str) -> str:
    decision = result.get("decision", "unknown")
    score = result.get("score", 0)
    rule = result.get("rule", "unknown")
    missing = result.get("missing") or []
    contradictions = result.get("contradictions") or []
    decision_id = result.get("decisionId") or "(none)"
    missing_s = ", ".join(missing) if missing else "none"
    contra_s = ", ".join(contradictions) if contradictions else "none"
    return (
        f"Evidence gate blocked ({need}): decisionId={decision_id}, "
        f"decision={decision}, side={result.get('side')}, score={score}, "
        f"rule={rule}, missing=[{missing_s}], contradictions=[{contra_s}]. "
        f"Required: {need}."
    )


def deny(result: dict[str, Any], *, need: str) -> None:
    message = denial_message(result, need=need)
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


def allow() -> None:
    print(json.dumps({"permission": "allow"}))
    sys.exit(0)


def write_target_path(tool_input: dict[str, Any]) -> str:
    for key in ("path", "file_path", "filePath"):
        value = tool_input.get(key)
        if isinstance(value, str) and value.strip():
            return value.replace("\\", "/")
    return ""


def normalize_rel_path(repo_root: Path, file_path: str) -> str:
    path = Path(file_path)
    if path.is_absolute():
        try:
            return path.resolve().relative_to(repo_root).as_posix()
        except ValueError:
            return path.as_posix()
    return file_path.replace("\\", "/")


def parse_mcp_tool_input(raw: str | dict[str, Any] | None) -> dict[str, Any]:
    if raw is None:
        return {}
    if isinstance(raw, dict):
        return raw
    if isinstance(raw, str) and raw.strip():
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            return {}
        return parsed if isinstance(parsed, dict) else {}
    return {}


def is_jira_bug_create(tool_name: str, tool_input: dict[str, Any]) -> bool:
    if tool_name not in JIRA_CREATE_TOOLS:
        return False
    issue_type = tool_input.get("issueType") or tool_input.get("issue_type")
    if not isinstance(issue_type, str):
        return False
    return issue_type.strip().lower() == JIRA_BUG_TYPE.lower()
