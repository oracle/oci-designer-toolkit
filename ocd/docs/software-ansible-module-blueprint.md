# Blueprint — Software & Ansible Provisioning Module

> Status: design / not yet implemented. Goal: let a user **search/select software**,
> **add external GitHub projects**, **read prerequisites**, and **run Ansible to install
> it after Terraform provisioning** — integrated with the existing OCTO Landing Zone /
> Designer Terraform flow.

## 1. Concept

After the Designer/Landing Zone produces Terraform and OCI provisions the
infrastructure (compute instances, IPs, SSH keys), a new **Software** module:

1. **Search/select software** from a curated catalog (Docker, Nginx, PostgreSQL,
   k3s, …) — each entry links to an **Ansible role** (Galaxy or GitHub) and declares
   **prerequisites** (OS, min versions, ports, other packages).
2. **Add external GitHub projects** — reuse the existing source-manifest mechanism to
   register arbitrary `ansible-role`/`playbook` repos as installable software.
3. **Read prerequisites** — surface each package's requirements and validate them
   against the target instances (shape, OS image, open ports/NSGs).
4. **Generate + run Ansible after Terraform** — derive an Ansible **inventory** from the
   design's compute instances (using the IP locals Terraform already emits), generate a
   **playbook** that applies the selected roles, and run it (or emit a runnable bundle)
   once `terraform apply` completes.

## 2. What already exists (reuse — do not rebuild)

| Capability | Where | Reuse as |
| --- | --- | --- |
| Terraform export → directory of `.tf` | `packages/export/src/terraform/{OcdTerraformExporter,OciExporter}.ts` | Add an `outputs.tf` with an Ansible-inventory-shaped output |
| Per-instance IP locals | `OciInstance.generateAdditionalResourceLocals` (emits `<name>_private_ip`, `<name>_public_ip`) | Source for Ansible inventory hosts |
| Instance SSH key + cloud-init | `OciInstance` model: `metadata.sshAuthorizedKeys`, `metadata.userData`, `createVnicDetails.assignPublicIp` | Inventory `ansible_user`/key + optional bootstrap |
| `ansible` storage on a design | `OcdDesign.userDefined.ansible` (already reserved) | Persist selected packages + generated playbook/inventory |
| External GitHub source manifest + installer | `OcdLzSources.json` (schema) + `scripts/setup_landing_zone.mjs` + `OcdLzAddonUpdater` | New `role: "software-addon"` entries; same clone/pin/install flow |
| Integration registry + UI mode mounting | `OcdIntegrationRegistry.ts` (categories), `OcdConsole.tsx` (`displayPage` switch + toolbar) | New `category: 'provisioning'` + `displayPage: 'software'` |
| Curated-catalog pattern | `landingzone/templates/OcdArchitectureTemplates.ts` + `OcdTemplateGallery.tsx` | Pattern for `OcdSoftwareCatalog.ts` + a software gallery |
| Multi-language artifact gen | `discovery/OcdDiscoveryProvisioning.ts` (`language: terraform|json|yaml|bash|python`) | Pattern for emitting `inventory.yml` / `playbook.yml` / `run.sh` |

## 3. What must be built new

1. **`OcdSoftwareCatalog.ts`** — curated `OcdSoftwarePackage[]`:
   ```ts
   interface OcdSoftwarePackage {
     id: string; name: string; vendor: string; tags: string[]
     prerequisites: { tool: string; minVersion?: string; ports?: number[]; os?: string[] }[]
     ansible: { source: 'galaxy' | 'github'; ref: string; role: string }  // e.g. github:geerlingguy/ansible-role-docker
     defaultVars?: Record<string, unknown>
   }
   ```
   Seed with ~15 common packages; later, entries can also come from registered
   `software-addon` GitHub sources.

2. **Ansible inventory bridge** — `OcdAnsibleInventory.ts`: given an `OcdDesign`,
   enumerate compute instances → produce a structured inventory keyed by environment /
   tier, each host referencing the Terraform IP output and SSH user/key. Emit both:
   - a Terraform `output "ansible_inventory"` block (so it's populated from real state), and
   - a static `inventory.yml` skeleton for offline/preview.

3. **Playbook generator** — `OcdAnsiblePlaybook.ts`: from the selected packages →
   a `playbook.yml` that pulls each role (`requirements.yml` for Galaxy/GitHub) and applies
   it to the matching host group, threading `defaultVars`.

4. **Prerequisite validator** — `OcdSoftwarePrereqs.ts`: cross-check each package's
   prerequisites against the design (instance OS image, shape, ports vs NSG/security-list
   rules) and report blockers/warnings — mirroring the AI Architect's validation style.

5. **UI** — `pages/OcdSoftware.tsx` (lazy-loaded): software search/gallery → selection →
   prerequisite report → generated inventory/playbook preview → "Download bundle" /
   "Run after apply". Register in `OcdIntegrationRegistry` + `OcdConsole` `displayPage`
   switch + a toolbar button (`onSoftwareClick`).

6. **Execution wrapper** (Electron/web split, like Terraform import/export):
   - **Electron / web-server:** run `ansible-playbook -i inventory.yml playbook.yml` after
     a successful `terraform apply`, streaming logs.
   - **Web-only:** emit a self-contained bundle (`inventory.yml`, `playbook.yml`,
     `requirements.yml`, `run.sh`) the user runs themselves — same pattern the app already
     uses for Terraform downloads.

## 4. Data flow

```
Designer/LZ config ──► Terraform export ──► (outputs.tf: ansible_inventory) ──► terraform apply
        │                                                          │
        ▼                                                          ▼
 Software module: pick packages ─► prereq validate ─► playbook.yml + requirements.yml
        │                                                          │
        └──────────────► OcdDesign.userDefined.ansible  ◄──────────┘
                                   │
                                   ▼
                 ansible-playbook -i <inventory-from-apply> playbook.yml
```

## 5. Phased implementation

- **Phase 1 — Scaffold.** New `displayPage: 'software'`, `OcdSoftware.tsx` shell, registry
  entry (`category: 'provisioning'`), toolbar button. No logic yet. (small)
- **Phase 2 — Catalog + prerequisites.** `OcdSoftwareCatalog.ts` (seed list), search UI,
  `OcdSoftwarePrereqs.ts` validator + report. (medium)
- **Phase 3 — Terraform→Ansible bridge.** `OcdAnsibleInventory.ts` + `outputs.tf`
  inventory block; `OcdAnsiblePlaybook.ts`; downloadable bundle. Persist to
  `userDefined.ansible`. (medium)
- **Phase 4 — External software sources.** `role: "software-addon"` in the source manifest;
  installer support in `setup_landing_zone.mjs`; surface registered repos in the catalog. (medium)
- **Phase 5 — Execution.** Electron/web-server `ansible-playbook` runner with log streaming,
  gated behind a "run after apply" toggle; web build stays download-only. (medium/large)

## 6. Risks / decisions

- **No Ansible runtime in the browser** — web build must stay download-only; live execution
  is Electron/web-server only (same split as Terraform import/export).
- **Inventory must come from real `terraform apply` state**, not the design guess — the
  `outputs.tf` inventory block is the source of truth; the static skeleton is preview-only.
- **Prerequisite truth** depends on the chosen OS image/shape — validate against the design,
  and fail-closed (warn) when the image OS can't be determined.
- **Security** — never bundle private keys; reference key paths/ssh-agent. Treat external
  `software-addon` repos as untrusted (pin commits, like the LZ sources do).
