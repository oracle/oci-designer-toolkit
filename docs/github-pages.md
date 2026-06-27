# OCD Web App on GitHub Pages (static deploy)

The OCD web app (the Electron renderer, built standalone) can be published as a
**static site** to GitHub Pages. No server is involved — everything that can run
client-side runs in the browser.

## URL pattern

A GitHub *project* site is served under a repo sub-path:

```
https://<user-or-org>.github.io/<repo>/
```

For this repo (`oci-designer-toolkit`) the default is:

```
https://<user-or-org>.github.io/oci-designer-toolkit/
```

The build's `base` path must match that sub-path so every asset URL (JS, CSS, the
`libjsonnet.wasm`) resolves. The Landing Zone wizard resolves the wasm against
`document.baseURI`, so once the page is served under the correct sub-path the wasm
loads with no extra configuration.

## What works (fully client-side)

| Feature | Status on Pages |
|---|---|
| Landing Zone wizard generation (go-jsonnet via WASM) | Works — `libjsonnet.wasm` is bundled at the base root |
| Terraform / OKIT import (client-side parsing) | Works |
| Palette, drag/drop design canvas | Works |
| Themes (light/dark/redwood/etc.) | Works |
| Cost estimate from the **bundled price snapshot** | Works |
| LZ "update available" notifications | Works |

## What needs a backend (unavailable on Pages)

| Feature | Why | Behavior on Pages |
|---|---|---|
| Live OCI discovery / import-from-OCI / Reference Data Query | Needs the local `@ocd/web-server` (`/api/oci`) to read `~/.oci/config` and call the OCI SDK server-side | The discovery dialog shows its connection error — expected |
| Live pricing (cetools) | Needs the `/api/pricing` proxy | Falls back to the bundled price snapshot — expected |

These degrade gracefully; the app stays usable.

## Build it locally

The static build lives in the desktop package and emits to
`ocd/packages/desktop/web-dist/`.

```bash
# From the repo root:
npm run github-action-install            # install deps (legacy-peer-deps)
npm run github-action-compile-for-codegen
npm run github-action-generate           # generate gitignored resource files
npm run setup-lz                         # vendor the public OCI OE jsonnet sources
npm run github-action-build              # build @ocd/* libs (incl. @ocd/react)
npm run build:pages                      # build the static site -> web-dist
```

> `github-action-generate` and `setup-lz` are required because the generated
> provider resource files and the OE jsonnet sources are **not** committed
> (gitignored / skip-worktree). Without them the `@ocd/react` build and the wizard
> would be missing inputs.

Output: `ocd/packages/desktop/web-dist/` containing `index.html`, `404.html`,
`.nojekyll`, the hashed `assets/` JS+CSS, and `libjsonnet.wasm`.

### Serve / verify locally

```bash
npx serve ocd/packages/desktop/web-dist
```

Because the build applies a `/oci-designer-toolkit/` base by default, plain
`serve` at the root will 404 on assets. To preview at the root, build with the
root base override (see below) or serve behind the matching sub-path.

## Base-path override

The base is controlled by the `OCD_PAGES_BASE` env var (read in
`ocd/packages/desktop/vite.web.config.mts`). It is normalized to always start and
end with `/`.

```bash
# Default (canonical repo name)
npm run build:pages                                  # base = /oci-designer-toolkit/

# Fork / different repo name
OCD_PAGES_BASE=/my-fork/ npm run build:pages

# Root deploy (user/org site or custom domain)
OCD_PAGES_BASE=/ npm run build:pages
```

The GitHub Actions workflow derives the base automatically from the repository
name (`/<repo>/`), so a fork deploys correctly with no edits. A
`workflow_dispatch` run accepts an optional `base_path` input to override it.

## Deploy via GitHub Actions

The workflow `.github/workflows/pages.yml`:

1. Triggers on push to `master` (or manual `workflow_dispatch`).
2. `actions/checkout` + `actions/setup-node` (Node 22).
3. `npm run github-action-install` — install dependencies.
4. `npm run github-action-compile-for-codegen` — compile codegen prerequisites.
5. `npm run github-action-generate` — **codegen** for the gitignored resource files.
6. `npm run setup-lz` — fetch the public OCI Operating Entities jsonnet sources.
7. `npm run github-action-build` — build the `@ocd/*` workspaces (incl. `@ocd/react`).
8. `npm run build:pages` with `OCD_PAGES_BASE=/<repo>/` — produce `web-dist`.
9. `actions/configure-pages` + `actions/upload-pages-artifact` (uploads
   `ocd/packages/desktop/web-dist`) + `actions/deploy-pages`.

No secrets or OCIDs are required — it is a public static deploy from the repo.

### One-time repo setup

In the repo settings, set **Settings → Pages → Build and deployment → Source =
GitHub Actions**. Then push to `master` (or run the workflow manually) to deploy.

## Notes

- `.nojekyll` is emitted so GitHub Pages serves underscore-prefixed files/dirs
  (e.g. any `_assets`) verbatim instead of running Jekyll.
- `404.html` is a copy of `index.html` so deep links resolve to the app shell.
- This static build is independent of the Electron desktop build — `npm run web`
  (dev) and the electron-forge packaging are unchanged.
