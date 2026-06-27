"""Unit tests for the observability Landing Zone cost helper utilities."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

SCRIPTS_DIR = Path(__file__).resolve().parents[1]
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from estimate_observability_lz_costs import read_json  # noqa: E402


def test_read_json_returns_object(tmp_path: Path) -> None:
    path = tmp_path / "estimate.json"
    payload = {"currency": "USD", "monthly_estimate": {"estimated_usd": 12.5}}
    path.write_text(json.dumps(payload), encoding="utf-8")

    assert read_json(path) == payload


def test_read_json_rejects_non_object(tmp_path: Path) -> None:
    path = tmp_path / "list.json"
    path.write_text(json.dumps([1, 2, 3]), encoding="utf-8")

    with pytest.raises(ValueError):
        read_json(path)
