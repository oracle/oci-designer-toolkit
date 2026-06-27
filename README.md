[![License: UPL](https://img.shields.io/badge/license-UPL-green)](https://img.shields.io/badge/license-UPL-green)

# oci-designer-toolkit-next-gen

**oci-designer-toolkit-next-gen** is a new Next Gen OCI architecture design product that started from Oracle OKIT / OCI Designer Toolkit and has evolved into a different project focused on Landing Zone Next Gen, discovery-driven migration planning, OCI resource analytics, governance, cost estimation, and a modern Redwood desktop experience.

This repository is no longer presented as the upstream OKIT desktop beta. It preserves OKIT compatibility where useful, but the active product direction is Next Gen OCI design, discovery, analysis, and Landing Zone delivery.

Current enhanced fork release: [v0.4.5.8](CHANGELOG.md#enhanced-fork-release-v0458). Compatibility reference: [OKIT Classic 0.70.0](CHANGELOG.md#okit-classic-version-0700).

## What This Product Adds

- **Oracle Redwood Next Gen desktop UX** aligned with Landing Zone Next Gen design patterns.
- **Landing Zone Wizard** that renders OCI Operating Entities Landing Zone JSON via jsonnet-WASM and opens the result directly on the drag-and-drop canvas.
- **Landing Zone import, update, and plan/diff** for generated `iam.json`, `network.json`, and `observability.json` outputs.
- **Realm, Region, AD, and FD scaffolding** that keeps wizard-generated topology and designer frames reconciled.
- **Real OCI cost estimation** using Oracle public list-pricing data, compute shape SKU mapping, multi-currency support, and snapshot fallback.
- **Discovery Workbench** for inventory, dependency topology, utilization and cost rollups, OCI target mapping, migration waves, Landing Zone recommendations, and Resource Analytics.
- **Architecture Agent** for chat-driven OCI architecture generation. It works offline with deterministic local planning and can call any OpenAI-compatible LLM endpoint that the user provides at runtime, then applies the generated plan directly to the Designer canvas.
- **Agentic Zero Trust architecture generation** with Redwood-styled reasoning -> policy -> scoped-execution UX, prompt templates, and editable OCI controls for API Gateway, Functions, Dynamic Groups, IAM policies, Vault, Data Safe, Cloud Guard, Logging Analytics, and Service Connector evidence pipelines.
- **Oracle Resource Analytics integration** through desktop IPC and web-server endpoints with shared SELECT-only SQL validation in `@ocd/core`.
- **Governance, remediation, and reachability analysis** for public exposure, weak segmentation, missing tags/budgets, unsafe DB placement, route-table gaps, dangling route targets, and internet-reachable databases.
- **Enterprise IAM and policy blueprint overlay** for Landing Zone groups, compartment-scoped policy bundles, and governance tags.
- **OKE-native and Database Observability overlays** for VCN-native CNI, Workload Identity, Vault/Key, DBM, OPSI, Database Insight, and Management Agent patterns.
- **Architecture template gallery** for curated OCI starter architectures.
- **OKIT Classic 0.70 parity workbench** that tracks Classic views, import/export/query surfaces, image export, Resource Manager handoff, and portable JSON introspection against the Next Gen implementation.
- **Drag-to-connect and draw.io import** for faster relationship modeling and diagram migration.
- **Expanded OCI catalog** with 265 curated OCI services, official Oracle diagram icons, Terraform import/export, Markdown/Excel export, property panels, validators, and discovery/migration resource batches.
- **Release hardening** with Vitest, Playwright E2E, static E2E serving, web bundle splitting, Node 26 CI alignment, macOS packaging, and pre-commit redaction checks.

No OCIDs, tenancy names, or secrets are stored in this repository. You supply your own OCI configuration at runtime.

## Latest Additions Since The v0.4.5 Fork Baseline

- `v0.4.5.1`: Landing Zone Next Gen hero CTA, architecture templates, upstream OKIT feature-sync banner, and the first Governance page.
- `v0.4.5.2`: Governance remediation summaries, Copy Terraform, and safe one-click fixes for deterministic cases.
- `v0.4.5.3`: Network reachability analysis and Landing Zone plan/diff.
- `v0.4.5.4`: Enterprise IAM and Policy blueprint, Node 26 CI pinning, and durable macOS DMG creation under endpoint protection.
- `v0.4.5.5`: ADM and AI Document/Language/Anomaly Detection catalog curation plus catalog guard tests.
- `v0.4.5.6`: Discovery Workbench, Resource Analytics integration, Landing Zone discovery recommendations, E2E coverage, and discovery/migration catalog curation.
- `v0.4.5.7`: Product rename to `oci-designer-toolkit-next-gen`, OKIT Classic 0.70 parity workbench, codegen test runner, audit hygiene, and updated Next Gen documentation.
- `v0.4.5.8`: BYO-LLM Architecture Agent, local deterministic planner fallback, chat-to-design generation, Agentic Zero Trust prompt/control mapping, Redwood UX refresh, toolbar/View menu entry, and Playwright E2E coverage for applying generated designs.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system architecture and [docs/oci-lz-designer-roadmap.md](docs/oci-lz-designer-roadmap.md) for the roadmap.

## Build And Run

Run these from the repo root unless noted:

```bash
npm run setup-lz        # one-time: fetch OE Landing Zone sources needed by the wizard
npm run setup-lz:latest # same, but pin to the latest upstream OE release
```

Then, from the `ocd/` directory:

```bash
npm run build                                   # build all workspaces
npm run dev-desktop                             # build and launch the desktop app in dev
npm run package --workspace=packages/desktop    # produce unsigned .app output under ocd/dist/
npm run make-macos-arm64 --workspace=packages/desktop  # build the macOS arm64 DMG installer
```

The wizard's `libjsonnet.wasm` is asar-unpacked so the renderer can fetch it under `file://`. `prebuild` copies the React CSS themes and wasm into the desktop package. It auto-runs before `npm run build`, but not before direct `package` or `make` runs:

```bash
npm run prebuild --workspace=packages/desktop
npm run package  --workspace=packages/desktop
```

The DMG maker requires the optional `appdmg` native dependency. Use `npm run package --workspace=packages/desktop` when you only need a runnable `.app`.

## Security Audit Behind Corporate TLS Inspection

If `npm audit` fails with `UNABLE_TO_VERIFY_LEAF_SIGNATURE` or `unable to verify the first certificate`, treat it as a local trust-store problem rather than a vulnerability result. Export the corporate root/intermediate CA as PEM and run:

```bash
NODE_EXTRA_CA_CERTS=/path/to/corporate-ca.pem npm audit --omit=dev
```

Do not use `strict-ssl=false`; keep TLS verification enabled and fix the local CA trust path instead.

## Legacy OKIT Background

The sections below are retained as upstream OKIT / OCD historical context. The active project in this repository is **oci-designer-toolkit-next-gen**.

## OKIT Desktop (OCD) [0.3.0](CHANGELOG.md#okit-desktop-version-0.3.0)

Full Release Details Can Found [0.3.0 Release](https://github.com/oracle/oci-designer-toolkit/releases/tag/v0.3.0).

OKIT Desktop is the next generation implementation of the OKIT Classic design tool that takes the concepts within OKIT Classic and re-implements them within an Electron based desktop application, providing native installs for Mac, Windows and Linux.

The OKIT Desktop provides the user with a fully freeform Drag & Drop canvas with the ability to create multiple pages to represent the same design in alternative formats, as seen below. As with the OKIT Classic the properties of resources can be editted within the properties panel along with the ability to add detailed description of each resource, if required. The OKIT Desktop will provide feature compatibility with the OKIT Classic allowing the user multiple views of the design information:

- Views
    - Design
    - Documentation
    - Variables
    - Common Tags
    - Markdown
    - Tabular
    - Terraform

Exporting the design will now allow the following options:

- Export
    - Markdown
    - Terraform
    - Excel
    - Image

Importing the design will allow the following options
- Import
    - Query
        - OCI
    - Terraform

The OKIT Desktop release is also preparing for Multi-Cloud implementation of Oracle database and will be extended to include Azure, Google and AWS. This is currently Alpha release and hence limited in its functionality.

### Traditional Design
![Ocd Desktop](https://github.com/oracle/oci-designer-toolkit/blob/master/ocd/images/OcdDesktop3.png)
### Connection Based View
![Ocd Desktop Connections](https://github.com/oracle/oci-designer-toolkit/blob/master/ocd/images/OcdDesktop4.png)

### Installation
OKIT Desktop is the next iteration of OKIT and is currently available as a Beta release.
The native installables can be found in the Assets section on the [0.3.0 Release](https://github.com/oracle/oci-designer-toolkit/releases/tag/v0.3.0).
1. MacOS
    1. [Arm dmg](https://github.com/oracle/oci-designer-toolkit/releases/download/v0.3.0/ocd-0.3.0-arm64.dmg)
    2. [x64 dmg](https://github.com/oracle/oci-designer-toolkit/releases/download/v0.3.0/ocd-0.3.0-x64.dmg)
2. Windows
    1. [Setup](https://github.com/oracle/oci-designer-toolkit/releases/download/v0.3.0/ocd-0.3.0-Setup.exe)
3. Linux
    1. [rpm](https://github.com/oracle/oci-designer-toolkit/releases/download/v0.3.0/ocd-0.3.0-1.x86_64.rpm)
    2. [deb](https://github.com/oracle/oci-designer-toolkit/releases/download/v0.3.0/ocd_0.3.0_amd64.deb)

At present the binaries are unsigned so on Mac and Windows you will specifically need to authorise the first run.

For anyone trying to install the Desktop version on a Mac running Sequoia 15.x.x you will probably notice that you can no longer override the licence warning within settings. There is a way around this and it is to execute the following once thw dmg has been installed.
```bash
xattr -d com.apple.quarantine /Applications/ocd.app
```



## OKIT Classic [0.70.0](CHANGELOG.md#okit-classic-version-0.70.0)

Full Release Details Can Found [0.70.0 Release](https://github.com/oracle/oci-designer-toolkit/releases/tag/v0.70.0).

OKIT Classic is the original browser based tool that allows the user to [design](https://www.ateam-oracle.com/introduction-to-okit-the-oci-designer-toolkit),
[deploy](https://www.ateam-oracle.com/introduction-to-okit-the-oci-designer-toolkit) and visualise ([introspect/query](https://www.ateam-oracle.com/the-oci-designer-toolkit-query-feature))
OCI environments through a graphical web based interface.

- [Design](https://www.ateam-oracle.com/introduction-to-okit-the-oci-designer-toolkit)

    The Web based interface will allow architects and designers to build a visual representation of their infrastructure
    and then export this in a number of formats.

    - svg
    - png
    - jpeg

- [Export](https://www.ateam-oracle.com/introduction-to-okit-the-oci-designer-toolkit)

    Once completed the design can be enhanced to add key property information allowing the designed infrastructure to
    be exported to a number of DevOps frameworks or Markdown for documentation.

    - Terraform
    - OCI Resource Manager
    - Markdown

    This allows for rapid proto-typing and building.

- [Introspect](https://www.ateam-oracle.com/the-oci-designer-toolkit-query-feature)

    OKIT will also allow the user to introspect existing OCI environments, through simple query functionality embedded within the
    web interface, to provide a portable generic json file, that can be used to visualise existing systems or generate terraform/ansible.

### Installation
Detailed OKIT Installation steps can be found in the [OCI Designer Toolkit Installation Guide](okitclassic/documentation/Installation.md).
1. [MacOS](okitclassic/documentation/Installation.md#macos)
2. [Windows 10 / WSL (Ubuntu)](okitclassic/documentation/Installation.md#windows-10--wsl-ubuntu)
3. [Oracle Linux](okitclassic/documentation/Installation.md#oracle-linux-ol8)





## Releases

See [Releases](https://github.com/oracle/oci-designer-toolkit/releases)





## Blogs
- [Introduction to OKIT the OCI Designer Toolkit](https://www.ateam-oracle.com/introduction-to-okit-the-oci-designer-toolkit)
- [The OCI Designer Toolkit Templates Feature](https://www.ateam-oracle.com/the-oci-designer-toolkit-templates-feature)
- [The OCI Designer Toolkit Query Feature](https://www.ateam-oracle.com/the-oci-designer-toolkit-query-feature)
- [OCI Designer Toolkit Resource Manager Integration](https://www.ateam-oracle.com/oci-designer-toolkit-resource-manager-integration)
- [The OCI Designer Toolkit Documentation Generation](https://www.ateam-oracle.com/the-oci-designer-toolkit-documentation-generation)





## Usage / Examples
The OKIT User / Usage Guide and worked examples can be found in the [OCI Designer Toolkit Usage Guide](okitclassic/documentation/Usage.md)





## Changes

See [CHANGELOG](CHANGELOG.md).





## Known Issues

You can find information on any known issues with OKIT here and under the Issues tab of this project's GitHub repository.
Any issues found with the tool should be raised on the projects issues page. Please check that the issue has not previously
been reported.

## Contributing

This project welcomes contributions from the community. Before submitting a pull request, please [review our contribution guide](./CONTRIBUTING.md)

## Security

Please consult the [security guide](./SECURITY.md) for our responsible security vulnerability disclosure process

## License

Copyright (c) 2020, 2024, Oracle and/or its affiliates.

Released under the Universal Permissive License v1.0 as shown at
<https://oss.oracle.com/licenses/upl/>.


If you would like to extend OKIT the development documentation can be found in [OCI Designer Toolkit Development Guide](okitclassic/documentation/Development.md)
