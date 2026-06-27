#!/usr/bin/env python3
"""Print generated OCI Observability Landing Zone cost estimates."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
ADDON_COST_ROOT = ROOT / "addons" / "oci-observability-end-to-end" / "cost"
PROFILES = ("free-first", "full-enterprise")


def read_json(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, dict):
        raise ValueError(f"{path.relative_to(ROOT)} must contain a JSON object")
    return data


def print_profile(profile: str) -> None:
    estimate_path = ADDON_COST_ROOT / f"{profile}-cost-estimate.json"
    query_path = ADDON_COST_ROOT / f"{profile}-usage-api-query.json"
    estimate = read_json(estimate_path)
    monthly = estimate.get("monthly_estimate", {})
    currency = estimate.get("currency", "USD")
    amount = float(monthly.get("estimated_usd") or 0)
    confidence = monthly.get("confidence", "not-set")
    print(f"{profile}: {currency} {amount:.2f}/month ({confidence})")
    for item in estimate.get("line_items", []):
        enabled = "enabled" if item.get("enabled") else "disabled"
        value = float(item.get("estimated_usd") or 0)
        print(f"  - {item.get('label', item.get('id'))}: {currency} {value:.2f} ({enabled})")
    print(f"  Usage API template: {query_path.relative_to(ROOT)}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--profile", choices=(*PROFILES, "all"), default="all")
    args = parser.parse_args()
    profiles = PROFILES if args.profile == "all" else (args.profile,)
    for profile in profiles:
        print_profile(profile)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
