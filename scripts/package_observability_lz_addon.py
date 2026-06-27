#!/usr/bin/env python3
"""Build OCI Resource Manager ZIP_UPLOAD packages for the observability add-on."""

from __future__ import annotations

import hashlib
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ADDON_ROOT = ROOT / "addons" / "oci-observability-end-to-end"
DIST_ROOT = ADDON_ROOT / "dist"
PROFILES = ("free-first", "full-enterprise")


def should_include(path: Path) -> bool:
    parts = set(path.parts)
    if ".terraform" in parts:
        return False
    if path.name in {".DS_Store", ".terraform.lock.hcl"}:
        return False
    return True


def package_profile(profile: str) -> Path:
    source = ADDON_ROOT / "resourcemanager" / profile
    if not source.exists():
        raise FileNotFoundError(f"missing Resource Manager source: {source.relative_to(ROOT)}")
    DIST_ROOT.mkdir(parents=True, exist_ok=True)
    output = DIST_ROOT / f"oci-observability-lz-{profile}-rms.zip"
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(source.rglob("*")):
            if path.is_file() and should_include(path):
                archive.write(path, path.relative_to(source).as_posix())
    return output


def write_checksums(outputs: list[Path]) -> Path:
    checksum_path = DIST_ROOT / "checksums.sha256"
    lines = []
    for output in sorted(outputs):
        digest = hashlib.sha256(output.read_bytes()).hexdigest()
        lines.append(f"{digest}  {output.name}")
    checksum_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return checksum_path


def main() -> int:
    outputs = [package_profile(profile) for profile in PROFILES]
    checksum_path = write_checksums(outputs)
    for output in outputs:
        print(output.relative_to(ROOT))
    print(checksum_path.relative_to(ROOT))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
