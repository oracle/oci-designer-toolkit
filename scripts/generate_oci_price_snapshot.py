#!/usr/bin/env python3
"""Generate the bundled OCI price snapshot TypeScript module.

Fetches PAY_AS_YOU_GO list prices from the public, unauthenticated Oracle Cloud
Cost Estimator Tools API for the part numbers used by the OCD cost estimator and
writes them into:

    ocd/packages/react/src/data/OciPriceListSnapshot.ts

The snapshot is an offline fallback used by the BOM page when the live pricing
fetch (Electron main process / web dev proxy) is unavailable.

Usage:
    python3 scripts/generate_oci_price_snapshot.py --currencies USD,EUR,GBP
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT_PATH = ROOT / "ocd" / "packages" / "react" / "src" / "data" / "OciPriceListSnapshot.ts"
CETOOLS_BASE_URL = "https://apexapps.oracle.com/pls/apex/cetools/api/v1/products/"

# Part numbers consumed by ocd/packages/react/src/cost/OcdResourcePriceMap.ts.
# Keep this list in sync with OCI_RESOURCE_COST_MAPPINGS and
# OcdComputeShapeSkus.ts. Only verified SKUs are listed; mappings whose SKU could
# not be verified use '' and are skipped here.
#
# Compute shape-family SKUs (roadmap B1) verified live against the cetools API on
# 2026-06-04. Modern Flex families bill OCPU + memory separately; older fixed
# families (E2/B1/X5/X7) bill a single bundled OCPU SKU (memory included).
PART_NUMBERS: tuple[str, ...] = (
    # ---- Compute: AMD EPYC Standard E-series ----
    "B90425",  # Compute - Standard - E2 (OCPU Per Hour, bundled)
    "B92306",  # Compute - Standard - E3 - OCPU
    "B92307",  # Compute - Standard - E3 - Memory
    "B93113",  # Compute - Standard - E4 - OCPU
    "B93114",  # Compute - Standard - E4 - Memory
    "B97384",  # Compute - Standard - E5 - OCPU
    "B97385",  # Compute - Standard - E5 - Memory
    "B111129",  # OCI - Compute - Standard - E6 - OCPU
    "B111130",  # OCI - Compute - Standard - E6 - Memory
    # ---- Compute: Ampere (Arm) ----
    "B93297",  # Compute - Standard - A1 - OCPU (always free; $0)
    "B93298",  # Compute - Standard - A1 - Memory ($0)
    "B109529",  # Compute - Standard - A2 OCPU
    "B109530",  # Compute - Standard - A2 Memory
    # ---- Compute: Intel X-series Standard ----
    "B94176",  # Compute - Standard - X9 - OCPU (Standard3)
    "B94177",  # Compute - Standard - X9 - Memory
    "B93311",  # Compute - Optimized - X9 - OCPU (Optimized3)
    "B93312",  # Compute - Optimized - X9 - Memory
    "B88317",  # Compute - Virtual Machine Standard - X5 (Standard1, bundled)
    "B88315",  # Compute - Bare Metal Standard - X5
    "B88514",  # Compute - Virtual Machine Standard - X7 (Standard2, bundled)
    "B88513",  # Compute - Bare Metal Standard - X7
    "B91120",  # Compute - Virtual Machine Standard - B1 (bundled)
    "B91119",  # Compute - Bare Metal Standard - B1
    # ---- Compute: Dense I/O ----
    "B93121",  # Compute - Dense I/O - E4 - OCPU
    "B93122",  # Compute - Dense I/O - E4 - Memory
    "B98202",  # OCI - Compute - Dense I/O - E5 OCPU
    "B98203",  # OCI - Compute - Dense I/O - E5 Memory
    "B112556",  # OCI - Compute - Dense IO - E6 Ax - OCPU
    "B112557",  # OCI - Compute - Dense IO - E6 Ax - Memory
    "B88516",  # Compute - Virtual Machine Dense I/O - X7 (DenseIO2, bundled)
    "B88515",  # Compute - Bare Metal Dense I/O - X7
    # ---- Compute: GPU (roadmap B1a; all-in per-GPU-per-hour rates) ----
    "B89734",  # Compute - GPU Standard - V2 (GPU2 / Tesla P100)
    "B92740",  # Compute - GPU - E3 (GPU3 / Tesla V100)
    "B93544",  # OCI - Compute - GPU - E4 (GPU4 / A100 40GB)
    "B95909",  # Compute - GPU - A10
    "B95907",  # Compute - GPU - A100 - v2 (A100 80GB)
    "B98415",  # OCI - Compute - GPU - H100
    "B109480",  # OCI - Compute - GPU - H100T
    "B110519",  # OCI - Compute - GPU - H200
    "B109479",  # Compute - GPU - L40S
    "B109485",  # OCI - Compute - GPU - MI300X
    "B88517",  # Compute - Bare Metal GPU Standard - X7 (P100)
    "B88518",  # Compute - Virtual Machine GPU Standard - X7 (P100)
    # ---- Compute: HPC (roadmap B1a; bundled OCPU-per-hour rates) ----
    "B96531",  # OCI - Compute - HPC - E5 (BM.Optimized3.36 era)
    "B90398",  # Compute - Bare Metal Standard - HPC - X7 (BM.HPC2.36)
    # ---- Storage / networking / object storage ----
    "B91961",  # Storage - Block Volume - Storage (GB Capacity Per Month)
    "B91962",  # Storage - Block Volume - Performance Units (Perf Unit/GB/Month)
    "B89057",  # Storage - File Storage - Storage (GB Capacity Per Month)
    "B93030",  # Load Balancer Base (Load Balancer)
    "B93031",  # Load Balancer Bandwidth (Mbps Per Hour)
    "B91628",  # Object Storage - Storage (GB Capacity Per Month)
    "B91627",  # Object Storage - Requests (10,000 Requests per Month)
    # ---- Database services (roadmap B2) ----
    "B95702",  # Autonomous AI Database - Transaction Processing - ECPU (ECPU Per Hour)
    "B95754",  # Autonomous AI Database Storage (GB Capacity Per Month)
    "B90569",  # Base Database Service - Standard (OCPU Per Hour)
    "B90570",  # Base Database Service - Enterprise (OCPU Per Hour)
    "B111584",  # Base Database Service - Database Storage (GB Capacity Per Month)
    "B108030",  # MySQL Database - ECPU (ECPU Per Hour)
    "B92426",  # MySQL Database - Storage (GB Capacity Per Month)
    # ---- OKE / security (roadmap B2) ----
    "B96545",  # OCI Kubernetes Engine - Enhanced Cluster (Cluster Per Hour)
    "B92092",  # Key Management Service - Key Versions (Key Version Per Month, list 0)
    # ---- Usage-based / serverless follow-ups (no design-time quantity yet) ----
    # Verified part numbers recorded for when the model adds these resources.
    "B88525",  # Networking - DNS (1,000,000 Queries)
    "B92593",  # Logging - Storage (GB Log Storage Per Month, list 0)
    "B90925",  # Monitoring - Ingestion (Million Datapoints, list 0)
    "B90940",  # Notifications - HTTPS Delivery (Million Delivery Operations, list 0)
    "B90939",  # Streaming - Storage (GB Per Hour)
    "B90938",  # Streaming - PUT or GET (GB Transferred)
    "B90618",  # Oracle Functions - Invocations (1MIL Invocations, list 0)
    "B90617",  # Oracle Functions - Execution Time (10,000 GB Memory-Seconds, list 0)
    "B92072",  # API Gateway - 1,000,000 API Calls Per Month
    "B95697",  # OCI Queue - 1,000,000 Requests
    "B94277",  # Web Application Firewall - Requests (1M Incoming Requests Per Month)
)

DEFAULT_CURRENCIES = ("USD", "EUR", "GBP", "JPY", "AUD", "CAD")


def fetch_currency_catalogue(currency: str, timeout: int = 30) -> dict[str, Any]:
    url = f"{CETOOLS_BASE_URL}?currencyCode={currency}"
    with urllib.request.urlopen(url, timeout=timeout) as response:  # noqa: S310 (trusted Oracle endpoint)
        return json.load(response)


def normalize_item(item: dict[str, Any], currency: str) -> dict[str, Any] | None:
    localizations = item.get("currencyCodeLocalizations") or []
    match = next((l for l in localizations if (l.get("currencyCode") or "").upper() == currency.upper()), None)
    if not match:
        return None
    prices = match.get("prices") or []
    payg = [p for p in prices if (p.get("model") or "").upper() == "PAY_AS_YOU_GO"]
    candidates = payg or prices
    if not candidates:
        return None
    tier = sorted(candidates, key=lambda p: p.get("rangeMin") or 0)[0]
    value = tier.get("value")
    if not isinstance(value, (int, float)):
        return None
    return {
        "unitPrice": value,
        "metricName": item.get("metricName") or "",
        "currency": currency.upper(),
        "displayName": item.get("displayName"),
    }


def build_snapshot(currencies: tuple[str, ...]) -> dict[str, dict[str, dict[str, Any]]]:
    snapshot: dict[str, dict[str, dict[str, Any]]] = {}
    for currency in currencies:
        catalogue = fetch_currency_catalogue(currency)
        by_part = {i.get("partNumber"): i for i in (catalogue.get("items") or [])}
        price_map: dict[str, dict[str, Any]] = {}
        for part in PART_NUMBERS:
            item = by_part.get(part)
            if not item:
                print(f"  WARN: {part} not found for {currency}", file=sys.stderr)
                continue
            entry = normalize_item(item, currency)
            if entry:
                price_map[part] = entry
        snapshot[currency.upper()] = price_map
        print(f"  {currency}: {len(price_map)}/{len(PART_NUMBERS)} parts", file=sys.stderr)
    return snapshot


def ts_value(value: Any) -> str:
    if value is None:
        return "undefined"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return repr(value)
    return json.dumps(value)


def render_price_map(price_map: dict[str, dict[str, Any]], indent: str) -> str:
    lines: list[str] = []
    for part, entry in price_map.items():
        fields = ", ".join(
            f"{key}: {ts_value(entry.get(key))}"
            for key in ("unitPrice", "metricName", "currency", "displayName")
            if entry.get(key) is not None or key != "displayName"
        )
        lines.append(f"{indent}'{part}': {{ {fields} }},")
    return "\n".join(lines)


def render_module(snapshot: dict[str, dict[str, dict[str, Any]]]) -> str:
    snapshot_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    currency_blocks: list[str] = []
    for currency, price_map in snapshot.items():
        body = render_price_map(price_map, " " * 8)
        currency_blocks.append(f"    {currency}: {{\n{body}\n    }},")
    blocks = "\n".join(currency_blocks)
    return f"""/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** GENERATED by scripts/generate_oci_price_snapshot.py - DO NOT EDIT BY HAND.
**
** Offline fallback list-pricing snapshot for the OCD cost estimator. Values are
** PAY_AS_YOU_GO list prices fetched from the public Oracle Cloud Cost Estimator
** Tools API. Regenerate with:
**     python3 scripts/generate_oci_price_snapshot.py --currencies USD,EUR,GBP,JPY,AUD,CAD
*/

import type {{ PriceMap }} from '@ocd/query/pricing'

export const OCI_PRICE_SNAPSHOT_DATE = '{snapshot_date}'

export const OCI_PRICE_SNAPSHOT: Record<string, PriceMap> = {{
{blocks}
}}

export const getSnapshotPriceMap = (currency: string): PriceMap => {{
    return OCI_PRICE_SNAPSHOT[(currency || 'USD').toUpperCase()] ?? OCI_PRICE_SNAPSHOT.USD ?? {{}}
}}
"""


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--currencies",
        default=",".join(DEFAULT_CURRENCIES),
        help="Comma-separated currency codes (default: %(default)s)",
    )
    args = parser.parse_args()
    currencies = tuple(c.strip().upper() for c in args.currencies.split(",") if c.strip())
    print(f"Fetching OCI list prices for {len(PART_NUMBERS)} parts in {currencies}", file=sys.stderr)
    snapshot = build_snapshot(currencies)
    module = render_module(snapshot)
    SNAPSHOT_PATH.write_text(module, encoding="utf-8")
    print(f"Wrote {SNAPSHOT_PATH.relative_to(ROOT)}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
