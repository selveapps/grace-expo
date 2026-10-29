#!/usr/bin/env python3
"""Turn node TAP, Vitest JSON, Jest JSON, or Playwright JSON into output.json.

Exits 0 when every fail_to_pass and pass_to_pass name passed and the test
process exited 0.
"""
import json
import sys
from pathlib import Path


def from_tap(text):
    found = {}
    for line in text.splitlines():
        ok = line.startswith("ok ")
        bad = line.startswith("not ok ")
        if not ok and not bad:
            continue
        # "ok 1 - title" / "not ok 2 - title"
        parts = line.split(" - ", 1)
        if len(parts) != 2:
            continue
        title = parts[1].strip()
        # A later retry should not turn a failure into a pass.
        if bad:
            found[title] = "FAILED"
        elif title not in found:
            found[title] = "PASSED"
    return found


def walk(node, found):
    if isinstance(node, dict):
        title = node.get("title") or node.get("fullName")
        status = node.get("status")
        if title and isinstance(status, str):
            found[title] = "PASSED" if status.lower() == "passed" else "FAILED"
        if title and "ok" in node and isinstance(node.get("ok"), bool):
            found[title] = "PASSED" if node["ok"] else "FAILED"
        for value in node.values():
            walk(value, found)
    elif isinstance(node, list):
        for item in node:
            walk(item, found)


def from_json(text):
    found = {}
    walk(json.loads(text), found)
    return found


def main():
    stdout, stderr, dest, config_path, proc_code = sys.argv[1:6]
    config = json.loads(Path(config_path).read_text())
    result_file = Path("/tmp/result.json")
    if result_file.exists() and result_file.stat().st_size:
        found = from_json(result_file.read_text())
    else:
        text = Path(stdout).read_text(errors="replace")
        found = from_json(text) if text.lstrip().startswith("{") else from_tap(text)
    required = list(config["fail_to_pass"]) + list(config["pass_to_pass"])
    tests = []
    for name in required:
        tests.append({"name": name, "status": found.get(name, "FAILED")})
    missing = [t["name"] for t in tests if t["status"] != "PASSED"]
    payload = {"tests": tests, "resolved": not missing and int(proc_code) == 0}
    Path(dest).write_text(json.dumps(payload, indent=2) + "\n")
    sys.exit(0 if payload["resolved"] else 1)


if __name__ == "__main__":
    main()
