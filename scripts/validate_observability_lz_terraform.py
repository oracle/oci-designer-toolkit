#!/usr/bin/env python3
"""Validate generated observability Landing Zone Terraform packages in temp dirs."""

from __future__ import annotations

import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ADDON_ROOT = ROOT / "addons" / "oci-observability-end-to-end"
PACKAGE_DIRS = [
    ADDON_ROOT / "terraform" / "free-first-hcl",
    ADDON_ROOT / "terraform" / "free-first-json",
    ADDON_ROOT / "terraform" / "full-enterprise-hcl",
    ADDON_ROOT / "terraform" / "full-enterprise-json",
    ADDON_ROOT / "resourcemanager" / "free-first",
    ADDON_ROOT / "resourcemanager" / "full-enterprise",
]
HCL_FILES = [
    ADDON_ROOT / "terraform" / "free-first-hcl" / "main.tf",
    ADDON_ROOT / "terraform" / "full-enterprise-hcl" / "main.tf",
    ROOT / "ocd" / "library" / "oci" / "ObservabilityLandingZoneFreeFirstTerraform.tf",
    ROOT / "ocd" / "library" / "oci" / "ObservabilityLandingZoneEnterpriseTerraform.tf",
]


def run(command: list[str], cwd: Path | None = None) -> None:
    subprocess.run(command, cwd=cwd, check=True)


def ignore_runtime_artifacts(_: str, names: list[str]) -> set[str]:
    return {name for name in names if name in {".terraform", ".terraform.lock.hcl"}}


def validate_package(source: Path, scratch_root: Path) -> None:
    if not source.exists():
        raise FileNotFoundError(f"missing Terraform package: {source.relative_to(ROOT)}")
    target = scratch_root / source.relative_to(ROOT).as_posix().replace("/", "__")
    shutil.copytree(source, target, ignore=ignore_runtime_artifacts)
    run(["terraform", "init", "-backend=false", "-input=false"], cwd=target)
    run(["terraform", "validate"], cwd=target)
    print(f"validated {source.relative_to(ROOT)}")


def main() -> int:
    if shutil.which("terraform") is None:
        raise RuntimeError("terraform executable not found on PATH")
    run(["terraform", "fmt", "-check", *[str(path.relative_to(ROOT)) for path in HCL_FILES]], cwd=ROOT)
    with tempfile.TemporaryDirectory(prefix="okit-observability-lz-terraform-") as scratch:
        scratch_root = Path(scratch)
        for package_dir in PACKAGE_DIRS:
            validate_package(package_dir, scratch_root)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
