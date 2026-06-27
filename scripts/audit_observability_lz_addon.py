#!/usr/bin/env python3
"""Run the full local audit for the generated observability Landing Zone add-on."""

from __future__ import annotations

import re
import subprocess
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ADDON_ROOT = ROOT / "addons" / "oci-observability-end-to-end"
DIST_ROOT = ADDON_ROOT / "dist"
SENSITIVE_NAME_FRAGMENTS = [
    ("fr4z", "qfimuxtr"),
    ("aaaadhp5ewo4e", "aaaaaaaaafs7q"),
    ("axfo51", "x8x2ap"),
    ("axox", "dievda5j"),
    ("id9y6", "mi8tcky"),
]
REDACTION_PATTERN = re.compile(
    r"ocid1\.(tenancy|compartment|instance|cluster|networksecuritygroup|loadbalancer|subnet|vnic|bootvolume|loganalytics[a-z]+|user)\.oc1\.[a-z]*\.[a-z0-9]+"
    r"|\b(130\.61|161\.153|144\.24|129\.153|141\.147|82\.77|109\.166)\.[0-9]+\.[0-9]+\b"
    r"|\b(" + "|".join(re.escape("".join(parts)) for parts in SENSITIVE_NAME_FRAGMENTS) + r")\b"
    r"|isk_[a-f0-9]{40}",
    re.IGNORECASE,
)
SCAN_ROOTS = [
    ROOT / "scripts",
    ROOT / "docs",
    ROOT / "examples",
    ROOT / "addons",
    ROOT / "baselines" / "oci-landing-zones.json",
    ROOT / "baselines" / "oci-landing-zones.lock.json",
    ROOT / "ocd" / "library" / "oci",
]
EXPECTED_ZIP_FILES = {
    "README_RESOURCE_MANAGER.md",
    "architecture.drawio",
    "cost-estimate.json",
    "main.tf.json",
    "observability.auto.tfvars.json",
    "okit-resource-manager-manifest.json",
    "usage-api-query.json",
}


def run(command: list[str]) -> None:
    subprocess.run(command, cwd=ROOT, check=True)


def scan_path(path: Path) -> None:
    if path.is_dir():
        for child in path.rglob("*"):
            if child.is_file() and not any(part in {".git", ".terraform", "dist"} for part in child.parts):
                scan_path(child)
        return
    if not path.exists() or path.suffix in {".png", ".jpg", ".jpeg", ".zip"}:
        return
    text = path.read_text(encoding="utf-8", errors="ignore")
    if REDACTION_PATTERN.search(text):
        raise RuntimeError(f"redaction-sensitive value found in {path.relative_to(ROOT)}")


def scan_redactions() -> None:
    for root in SCAN_ROOTS:
        scan_path(root)
    print("redaction scan passed")


def validate_zips() -> None:
    zip_paths = sorted(DIST_ROOT.glob("oci-observability-lz-*-rms.zip"))
    if len(zip_paths) != 2:
        raise RuntimeError(f"expected 2 Resource Manager ZIPs, found {len(zip_paths)}")
    for zip_path in zip_paths:
        with zipfile.ZipFile(zip_path) as archive:
            names = set(archive.namelist())
        if names != EXPECTED_ZIP_FILES:
            raise RuntimeError(f"{zip_path.relative_to(ROOT)} has unexpected files: {sorted(names)}")
        if any(name.startswith(".terraform") or name.endswith(".terraform.lock.hcl") for name in names):
            raise RuntimeError(f"{zip_path.relative_to(ROOT)} contains Terraform runtime artifacts")
        print(f"zip audit passed {zip_path.relative_to(ROOT)}")


def main() -> int:
    run(["python", "scripts/validate_observability_lz_library.py"])
    run(["python", "scripts/validate_observability_lz_terraform.py"])
    run(["python", "scripts/package_observability_lz_addon.py"])
    run(["python", "scripts/estimate_observability_lz_costs.py", "--profile", "all"])
    validate_zips()
    scan_redactions()
    run(["git", "diff", "--check"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
