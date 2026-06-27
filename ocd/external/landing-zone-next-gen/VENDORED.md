# Vendored — landing-zone-next-gen (iwan)

Embedded source-of-truth for the Landing Zone Next-Gen wizard, vendored from the
upstream project so the Designer Toolkit ships self-contained (no runtime
git-checkout).

- Upstream: https://github.com/iwanhoogendoorn/landing-zone-next-gen
- Pinned ref: 47438563279915d93ab4e8f1013f9378de6b9f82
- Excluded when vendoring: `.git/`, `3rd/` (go-jsonnet wasm + OCI operating
  entities — already vendored separately in the toolkit), `node_modules/`, `dist/`,
  `*.log`, and **`.env*`** (incl. `.env.example`, which carries a placeholder
  `GITHUB_PRIVATE_KEY` — never embed key-shaped material).

The toolkit's live LZNG UI is a port of `src-lzng` into
`ocd/packages/react/src/landingzone/`; this vendored copy is the reference that
port is kept in sync with. To refresh: re-run the setup-lz update, then
`node scripts/vendor-lzng.mjs` (applies the exclusions above).
