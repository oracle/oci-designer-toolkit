# OCI Stencil Icon Refresh (roadmap A3)

How the OCD designer's OCI palette icons are produced, how to add a missing
icon, and how to vendor / refresh Oracle's official OCI diagram icon set.

## 1. The icon pipeline (source → generated CSS → class names)

```
packages/react/src/css/*.css            (TRUE SOURCE — tracked in git)
        │   e.g. oci-theme.css holds one CSS rule per stencil:
        │       .oci-instance { background-image: url("data:image/svg+xml;base64,…"); }
        │
        ▼  npm run prebuild --workspace=packages/desktop
        │     (`cp ../react/src/css/*.css ./src/css`)
packages/desktop/src/css/*.css          (COPY — gitignored: **/desktop/src/css/*.css)
        │
        ▼  npm run generate-ocd-svg-css-desktop --workspace=packages/codegen-cli
        │     → node lib/esm/ocd-build-svg-css.js -d ../react/src/data -i ../desktop/src/css
        │     (OcdSvgCssGenerator reads EVERY *.css in the input dir and inlines each file
        │      verbatim into a String.raw entry keyed by filename)
        ▼
packages/react/src/data/OcdSvgCssData.ts (GENERATED — tracked in git)
        │     export const svgCssData = { 'oci-theme.css': String.raw`…`, … }
        │     export const ociSvgThemeCss = svgCssData['oci-theme.css']
        │     getSvgCssData(design) → string[] of theme CSS injected into the canvas/palette
        ▼
React app injects ociSvgThemeCss; the palette renders a stencil <div className={resource.class}>.
The CSS class (e.g. `.oci-instance`) supplies `background-image`, so the stencil shows a glyph.
```

### Class-name convention

- A palette resource's `class` (in `packages/react/src/data/OcdPalette.ts`, e.g.
  `oci-instance`) is **load-bearing**: the drop handler PascalCases it to resolve the
  model resource (`oci-instance` → `OciInstance`). Do not rename it to suit an icon.
- The SAME class string must have a matching `.<class> { background-image: … }` rule in
  `oci-theme.css`, or the stencil renders blank.
- Group/provider header classes (`oci-network`, `oci-storage`, `oci-provider`, …) are
  also styled here but render a text label, so a missing glyph there is not a blank stencil.

### Key facts

- **Edit `packages/react/src/css/oci-theme.css`, never `packages/desktop/src/css/…`** — the
  desktop copy is gitignored and overwritten by `prebuild`.
- `OcdSvgCssData.ts` is generated; regenerate it rather than hand-editing.
- The generator bundles *all* `*.css` files present in the input dir at generation time. If
  unrelated theme CSS (e.g. landing-zone / redwood-ng) is present but you only want to
  commit icon changes, regenerate with only the intended CSS files in the dir (move the
  others aside temporarily) so the committed diff stays scoped.

## 2. Adding / fixing a single icon (the authoritative path)

1. Author a small SVG in the existing Oracle "redwood" style:
   `viewBox="0 0 42 42"`, white circle background, glyph stroke `#2c5967`, thin strokes.
2. Base64-encode it and add a rule to `packages/react/src/css/oci-theme.css`:
   ```css
   .oci-my-resource {
       background-image: url("data:image/svg+xml;base64,<BASE64>");
   }
   ```
   (Optionally add `.oci-my-resource-background-colour` to the matching group rule near the
   bottom of the file so the stencil tile gets the themed fill.)
3. Copy + regenerate + build:
   ```bash
   cd ocd
   npm run prebuild --workspace=packages/desktop
   npm run generate-ocd-svg-css-desktop --workspace=packages/codegen-cli
   npm run build --workspace=packages/react
   ```
4. Verify the class now has a rule:
   ```bash
   grep -c '\.oci-my-resource ' packages/react/src/data/OcdSvgCssData.ts
   ```

### Quick gap audit (palette class → does an icon exist?)

```bash
cd ocd
node -e '
const fs=require("fs");
const css=fs.readFileSync("packages/react/src/css/oci-theme.css","utf8");
const icon=new Set(); const re=/([^{}]+)\{([^}]*)\}/g; let m;
while((m=re.exec(css))) if(/background-image\s*:/.test(m[2]))
  m[1].split(",").forEach(s=>{const x=s.trim().match(/\.(oci-[a-z0-9-]+)/); if(x) icon.add(x[1]);});
const src=fs.readFileSync("packages/react/src/data/OcdPalette.ts","utf8")
  .replace(/\/\*[\s\S]*?\*\//g,"").split("\n").filter(l=>!l.trim().startsWith("//")).join("\n");
const pal=new Set(); let r=/"class":\s*"(oci-[a-z0-9-]+)"/g;
while((m=r.exec(src))) pal.add(m[1]);
console.log("gaps:", [...pal].filter(c=>!icon.has(c)).sort());
'
```

## 3. Vendoring / refreshing Oracle's official OCI icon set

Reference page: <https://docs.oracle.com/en-us/iaas/Content/General/Reference/graphicsfordiagrams.htm>

The official set IS fetchable headlessly (verified). The page links two asset packs:

```bash
curl -sL -A "Mozilla/5.0" \
  https://docs.oracle.com/iaas/Content/Resources/Assets/OCI-Style-Guide-for-Drawio.zip \
  -o OCI-Style-Guide-for-Drawio.zip      # ~7 MB, HTTP 200
curl -sL -A "Mozilla/5.0" \
  https://docs.oracle.com/iaas/Content/Resources/Assets/OCI_Icons_Visio.zip \
  -o OCI_Icons_Visio.zip                 # ~7 MB, HTTP 200
```

**Important format note.** These packs do *not* contain standalone `.svg` files. They are
editor stencil libraries:

- `OCI-Style-Guide-for-Drawio.zip` → `OCI Library.xml` (a drawio `<mxlibrary>` of 224 shapes)
  plus `.drawio` toolkit files. As of the 24.2 pack the file unzips to
  `OCI Style Guide for Drawio/OCI Library.xml`.
- `OCI_Icons_Visio.zip` → Visio `.vssx` stencils (not used here).

**The drawio pack IS fully decodable to SVG (verified, automated).** This was done in
follow-up #2: 44 of the 46 OCD OCI *resource* stencils now ship Oracle's official glyphs,
normalized to the redwood `#2c5967` colour. See the working pipeline below.

#### Two-layer encoding (the decode that works)

```
OCI Library.xml
  └─ <mxlibrary>[ { "xml": <ENC1>, "w", "h", "title" }, … ]   (224 entries)
        ENC1 = base64( rawDeflate( uriEncode( mxGraphModelXml ) ) )
        decode: decodeURIComponent( zlib.inflateRawSync( Buffer.from(ENC1,'base64') ) )

  mxGraphModelXml is a stack of <mxCell> shapes composing ONE icon:
    - white rounded-square frame   (fillColor=#FFFFFF / #F5F4F2 / #FCFBFA / #fbf9f8 / #DFDCD8)
    - one or more glyph cells       (fillColor=#2d5967, #2c5967, #aa643b, #AE562C, … tinted)
    - a text-label cell below the 84-frame (y >= 84)   ← excluded
  Each glyph cell's style carries  shape=stencil(<ENC2>)
        ENC2 = base64( rawDeflate( uriEncode( stencilXml ) ) )   (SAME chain again)

  stencilXml is drawio's vector language on a 0..100 box:
    <shape><foreground><path>
      <move x= y=/> <line x= y=/> <curve x1= y1= x2= y2= x3= y3=/> <close/>
    </path><fillstroke/></foreground></shape>
    → maps 1:1 to SVG path commands  M / L / C / Z
```

#### Refresh / re-run procedure (fully scripted)

The converter + mapping + applier live in this repo's history of follow-up #2 and were run
from `/tmp`. To regenerate from a fresh pack:

1. Download + unzip:
   ```bash
   cd /tmp
   curl -sL -A "Mozilla/5.0" \
     https://docs.oracle.com/iaas/Content/Resources/Assets/OCI-Style-Guide-for-Drawio.zip \
     -o OCI-Style-Guide-for-Drawio.zip
   unzip -o -q OCI-Style-Guide-for-Drawio.zip -d /tmp/oci-official
   ```
2. **Convert** (`/tmp/oci-convert.js`): parse `<mxlibrary>`, for each entry decode ENC1,
   collect glyph cells (stencil cells whose `fillColor` is NOT a background tone:
   `none,#ffffff,#f5f4f2,#fcfbfa,#fbf9f8,#dfdcd8`) that sit inside the 84×84 frame
   (absolute `y < 84`, walking parent `mxCell` offsets), decode each stencil ENC2, translate
   `move/line/curve/close` → `M/L/C/Z` scaled from the 0..100 stencil box into the cell's
   geometry, then into a `viewBox="0 0 42 42"`. Recolour the whole glyph to `#2c5967` and
   wrap as `<g fill="#2c5967" fill-rule="evenodd">…paths…</g>`. (Oracle's frame is a rounded
   *square*, matching the dominant existing `oci-instance` style — so the output uses the
   full 84-frame, no imposed circle.)
3. **Map** (`/tmp/oci-mapping.js`): official library index → palette `oci-*` class. The
   mapping covers 44 resource classes; sub-resources without a dedicated official glyph reuse
   their parent-service glyph (e.g. `oci-mount-target`, `oci-file-system-export-set` →
   File Storage #10; `oci-drg-attachment/route-table/route-distribution` → DRG #30;
   `oci-load-balancer-backend-set/listener` → Load Balancer #18; `oci-oke-node-pool` → OKE
   #74; `oci-datascience-notebook-session` → Data Science #68).
4. **Apply** (`/tmp/oci-apply.js`): parse `oci-theme.css`, and for every rule whose selector
   list contains a mapped class, replace only its `url("data:image/svg+xml;base64,…")` with
   the new official data-URI. This preserves selector aliases (e.g.
   `.oci-vcn, .oci-virtual-cloud-network`), the `-background-colour` group rules, and the
   group/header icons. Idempotent.
5. Regenerate + build per §2 steps 3–4. **Set aside untracked theme CSS before codegen**
   (`ocd-lzng.css`, `ocd-redwood-ng-theme.css` in `packages/desktop/src/css/`) so the
   generated `OcdSvgCssData.ts` key set stays equal to HEAD's 10 keys, then restore them.

#### Glyphs Oracle does NOT ship (kept as-is)

- `oci-subnet` — only a *grouping* container shape (no glyph). Existing icon retained.
- `oci-ipsec` — no VPN/IPSec glyph; mapped to the **CPE** glyph (#21) as the closest
  official networking equivalent.
- The 6 group/header classes (`oci-network`, `oci-storage`, `oci-compute`, `oci-database`,
  `oci-identity`, `oci-container`) and `oci-provider` render text labels — intentionally
  left on their legacy art.

## 4. License / attribution

The vendored glyphs are derived from Oracle's official **OCI Architecture Diagram Toolkit /
Style Guide for Drawio** (`OCI-Style-Guide-for-Drawio.zip`, pack v24.2), published by Oracle
at <https://docs.oracle.com/iaas/Content/Resources/Assets/>. Oracle provides these icons for
use in OCI architecture diagrams. They have been recoloured to the OCD redwood `#2c5967` and
normalized to a 42×42 viewBox; the underlying glyph artwork remains Oracle's. Attribution:
"OCI service icons © Oracle, from the OCI Architecture Diagram Toolkit." Retain this note if
the icon set is refreshed.

## 5. Current state (after follow-up #2 — official set vendored)

- **52 active OCI palette classes.** 46 are resource stencils; 6 are group/provider header
  labels (`oci-network`, `oci-storage`, `oci-compute`, `oci-database`, `oci-identity`,
  `oci-container`) plus `oci-provider`.
- **44 resource classes now use Oracle's OFFICIAL glyphs** (decoded from the drawio pack,
  recoloured to `#2c5967`). Replaced in `oci-theme.css` (44 `background-image` rules) and
  regenerated into `OcdSvgCssData.ts`. The generated key set is unchanged (10 keys = HEAD).
- **2 resource classes kept their prior icon** (no official glyph exists): `oci-subnet`
  (grouping-only shape) and — `oci-ipsec` was mapped to the official CPE glyph as the nearest
  equivalent.
- The group/header classes and `oci-provider` keep their legacy art (text labels; never blank).
- Build verified green: `npm run build --workspace=packages/react` and
  `npm run prebuild --workspace=packages/desktop`. Gap audit (palette class → css rule) shows
  the only icon-less class is `oci-provider` (a text label), i.e. no blank stencils.
- The earlier hand-authored line icons (`oci-drg-route-table`, `oci-drg-route-distribution`,
  `oci-file-system-export-set`) were replaced by the official DRG / File Storage glyphs they
  semantically map to.
