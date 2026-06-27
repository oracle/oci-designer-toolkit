#!/usr/bin/env python3
"""Sync official OCI Landing Zones repositories used as OKIT/OCD baselines."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "baselines" / "oci-landing-zones.json"
LOCKFILE = ROOT / "baselines" / "oci-landing-zones.lock.json"


def run(command: list[str], cwd: Path | None = None) -> None:
    subprocess.run(command, cwd=cwd, check=True)


def resolve_branch(repo: dict[str, str]) -> str:
    branch = repo.get("branch", "default")
    if branch not in {"", "default", "HEAD"}:
        return branch
    result = subprocess.run(["git", "ls-remote", "--symref", repo["url"], "HEAD"], check=True, capture_output=True, text=True)
    first_line = result.stdout.splitlines()[0]
    return first_line.rsplit("/", 1)[-1].split()[0]


def sync_repo(repo: dict[str, str]) -> dict[str, object]:
    target = ROOT / repo["local_path"]
    branch = resolve_branch(repo)
    target.parent.mkdir(parents=True, exist_ok=True)
    if (target / ".git").exists():
        run(["git", "fetch", "--depth", "1", "origin", branch], cwd=target)
        run(["git", "checkout", branch], cwd=target)
        run(["git", "pull", "--ff-only", "origin", branch], cwd=target)
    else:
        run(["git", "clone", "--depth", "1", "--branch", branch, repo["url"], str(target)])
    commit = subprocess.run(["git", "rev-parse", "HEAD"], cwd=target, check=True, capture_output=True, text=True).stdout.strip()
    files = subprocess.run(["git", "ls-files"], cwd=target, check=True, capture_output=True, text=True).stdout.splitlines()
    baseline_files = [
        file
        for file in files
        if file.endswith((".json", ".tf", ".tfvars", ".yaml", ".yml", ".md", ".sh"))
    ][:100]
    return {
        "name": repo["name"],
        "url": repo["url"],
        "branch": branch,
        "commit": commit,
        "local_path": repo["local_path"],
        "baseline_files": baseline_files,
    }


def main() -> int:
    if not MANIFEST.exists():
        print(f"missing manifest: {MANIFEST.relative_to(ROOT)}", file=sys.stderr)
        return 1
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    synced = []
    for repo in manifest.get("repositories", []):
        print(f"syncing {repo['name']} -> {repo['local_path']}")
        synced.append(sync_repo(repo))
    LOCKFILE.write_text(json.dumps({"schema_version": "oci.okit.landing_zone_baselines_lock.v1", "repositories": synced}, indent=4, sort_keys=True) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
