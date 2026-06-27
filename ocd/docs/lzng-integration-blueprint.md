# Blueprint — Embed iwan's LZNG as the always-source & integrate across all components

> Status: design. The embedding (vendor + commit + default flag) is **done**; this
> document is the phased plan to integrate Landing Zone Next-Gen (LZNG) into every
> component of the Designer Toolkit.

## Source-of-truth (done)

- **Upstream:** `iwanhoogendoorn/landing-zone-next-gen` — the canonical LZNG source, **always**.
- **Embedded:** vendored (source-only, ~0.7 MB) at `ocd/external/landing-zone-next-gen/`
  (committed, ships with the toolkit; `.git`/`3rd`/`node_modules` excluded). See its
  `VENDORED.md`.
- **Marked** in `OcdLzSources.json`: `"default": true`, `"embedded": "ocd/external/landing-zone-next-gen"`
  on the `landing-zone-next-gen` entry; `LzSource` type carries `default?` + `embedded?`.
- **Live UI** stays the port under `ocd/packages/react/src/landingzone/` (kept in sync from
  the vendored copy); the gitignored `external/lz-addons/` checkout remains only for the
  upstream update-check flow.

**Next (enforcement):** make the source resolver treat `default: true` as the locked LZNG
source so it can't be switched away (UI shows it as canonical; `setup-lz` prefers the
embedded copy over a network checkout when present).

## Integration vectors — LZNG ⇄ every component

LZNG's artifact is a **Landing Zone config** → jsonnet (Operating Entities) → OCI resource
model (`OcdDesign`) → Terraform / draw.io. Each component plugs into that pipeline:

| # | Component | Today | Target integration |
| --- | --- | --- | --- |
| 1 | **Designer canvas** (`OcdDesigner`, `OcdCanvas`) | `OcdLzToModel.buildOcdDesignFromLz` turns LZ output into a design | **Bidirectional**: open a LZNG config as an editable design; edits round-trip back to the wizard config where structurally safe (`OcdLzReconcile`) |
| 2 | **AI Architect** (`OcdArchitectureAgent`) | Produces an `ArchitecturePlan` → design | **AI → LZNG**: map the plan's resources (network tiers, environments, security zones) into a seeded LZNG wizard config the user then refines |
| 3 | **Discovery** (`OcdDiscovery*`) | Imports a live tenancy → design | **Brownfield → LZNG**: reconcile discovered resources into a LZNG config (`OcdLzReconcile`) for "adopt existing into a landing zone" |
| 4 | **Integrations registry** (`OcdIntegrationRegistry`) | LZNG listed as an integration | First-class entry with **health checks**: embedded copy present, source pinned == upstream, jsonnet engine loadable |
| 5 | **Terraform / JSON import-export** | LZNG → jsonnet → TF; LZ JSON import (`OcdLzFileImport`); TF import (`OcdTerraformImporter`) | **Round-trip**: import existing TF/LZ-JSON → LZNG config; export LZNG config → TF + the Ansible bundle (see the software/ansible blueprint) |
| 6 | **Plans / cost estimator** | branch adds cost surfaces | Feed LZNG resources into the estimator for **per-environment / per-security-zone cost preview** in wizard step 5 (Review) |
| 7 | **Platform Templates** (wizard step 4) | curated starter architectures (`OcdArchitectureTemplates`) | Curated **LZNG configs** as templates; "start from template" seeds the wizard |

## Phases

- **P0 — Lock the source (small).** Source resolver honors `default: true`; `setup-lz`
  prefers the embedded copy; Integrations health-check for "embedded present + pinned==upstream".
- **P1 — AI Architect → LZNG (medium).** `ArchitecturePlan → LandingZoneConfig` mapper
  (reuse `SUPPORTED_KINDS`, the new relationship warnings, and `OcdLzToModel` in reverse);
  "Open in Landing Zone wizard" action on a generated plan.
- **P2 — Round-trip import (medium).** Extend `OcdLzFileImport` + `OcdTerraformImporter` to
  emit a `LandingZoneConfig` (not just an `OcdDesign`), so existing TF / LZ-JSON can be
  edited in the wizard.
- **P3 — Cost in Review (medium).** Wire LZNG resources → the cost estimator; show cost per
  environment/security-zone in wizard step 5 and on the design.
- **P4 — Discovery → LZNG (medium).** Brownfield reconcile path (`OcdLzReconcile`) from a
  discovered tenancy into a LZNG config.
- **P5 — Templates + Designer round-trip (medium).** LZNG configs as Platform Templates;
  Designer edits reconcile back to the wizard config.

## Cross-cutting

- **One config model.** Treat `LandingZoneConfig` as the hub; every component reads/writes it
  (or maps to/from it) rather than each owning a private representation.
- **Embedded-first.** Prefer the committed `ocd/external/landing-zone-next-gen/` over any
  network fetch; the upstream checkout is only for update detection.
- **Keep the port the live UI** — sync from the vendored copy on update; do not fork behavior.
- **Tests.** Each mapper (AI→LZNG, TF→LZNG, LZNG→cost) gets unit tests with fixture configs,
  mirroring the existing `OcdArchitectureAgent` / `OcdLzFileImport` test style.
