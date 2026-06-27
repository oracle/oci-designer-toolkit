#!/usr/bin/env bash
#
# A2 catalog curation — bounded autonomous loop (Sequential Pipeline pattern).
#
# Each iteration: curate the next batch of OCI services via the codegen pipeline,
# verify with the GATE-AWARE check (npm test + strict @ocd/model tsc + build:pages
# — NOT the full `npm run build`, which runs the un-compilable appdmg DMG step),
# commit locally, and update SHARED_TASK_NOTES.md. Push is left to the operator
# (needs ECC_SKIP_PREPUSH=1 until the Node-26/appdmg toolchain is fixed).
#
# Usage:
#   scripts/a2-curation-loop.sh --max-runs 5
#   scripts/a2-curation-loop.sh --max-runs 10 --batch 14
#
# Safety rails: bounded by --max-runs; stops on the completion signal
# (A2_CATALOG_COMPLETE) or when a verify gate fails (so a broken batch never
# compounds). Requires the `claude` CLI on PATH.

set -euo pipefail

MAX_RUNS=5
BATCH=14
NOTES="SHARED_TASK_NOTES.a2.md"
COMPLETION_SIGNAL="A2_CATALOG_COMPLETE"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --max-runs) MAX_RUNS="$2"; shift 2 ;;
    --batch)    BATCH="$2"; shift 2 ;;
    *) echo "unknown arg: $1"; exit 2 ;;
  esac
done

cd "$(dirname "$0")/.."   # repo root

# Seed the cross-iteration notes once (bridges context between fresh claude -p calls).
if [[ ! -f "$NOTES" ]]; then
  cat > "$NOTES" <<'EOF'
# A2 Catalog Curation — Shared Task Notes

## Goal
Expand the OCI catalog in curated batches toward the full provider set. Each
service needs a resourceMap entry + curated resourceAttributes in
ocd/packages/codegen/src/importer/data/OciResourceMap.ts.

## Hard rules (learned)
- A curated attribute leaf named `resources`/`resource`/`results` collides with the
  generator's reserved param -> TS2349 in the model validator. Drop such attributes.
- Verify with the STRICT model build: `npm run build --workspace=packages/model`.
- Do NOT run the full `npm run build` (the appdmg DMG maker won't compile on Node 26).

## Progress
- (loop appends per-iteration here)

## Next
- Pick services NOT already in OciResourceMap.ts; curate ~14/batch.
EOF
fi

verify() {
  # Gate-aware verify: strict model tsc + dependent builds + tests + web build.
  # All output is teed to .a2-verify.log so a failure is diagnosable (the gate
  # can flake if it races codegen settling — re-run once before treating as real).
  # Absolute log path so the redirect resolves the same regardless of the
  # subshell cwd (a relative ../ path would land in the parent dir).
  local log; log="$(pwd)/.a2-verify.log"; : > "$log"
  ( cd ocd && npm run compile-for-codegen ) >>"$log" 2>&1 || return 1
  # Full build INCLUDING @ocd/export — the terraform exporter catches base-property
  # collisions (e.g. a home_region attr -> homeRegion vs OciTerraformResource) that
  # the model build alone does not.
  ( cd ocd && npm run build --workspace=packages/model --workspace=packages/export \
      --workspace=packages/import --workspace=packages/react ) >>"$log" 2>&1 || return 1
  ( cd ocd && npm test ) >>"$log" 2>&1 || return 1
  ( cd ocd && OCD_PAGES_BASE=/ npm run build:pages ) >>"$log" 2>&1 || return 1
}

for ((i = 1; i <= MAX_RUNS; i++)); do
  echo "=== A2 curation iteration $i / $MAX_RUNS ==="

  # Non-interactive claude -p needs explicit permission to edit files + run the
  # codegen via Bash, or every edit is blocked. acceptEdits auto-applies edits;
  # allowedTools grants the tools the curation needs. (Global rule: configure
  # allowedTools, never --dangerously-skip-permissions.)
  # Build the prompt, then pass it via STDIN (robust for multi-line prompts with
  # --print; avoids positional-arg parsing breaking when flags are present).
  PROMPT="You are curating OCI services into the OKIT catalog (A2). Read $NOTES
for rules and progress. Add the NEXT $BATCH high-value OCI services that are NOT
already present in ocd/packages/codegen/src/importer/data/OciResourceMap.ts.
RULES for each service:
- It MUST exist in ocd/packages/codegen-cli/schema/oci/tf-schema.json (grep the
  oci_* name; count >0). A map entry for a non-existent type silently generates
  nothing.
- Add a resourceMap entry + curated resourceAttributes (the key user-set fields +
  relationship *Id FKs).
- NEVER use an attribute whose name is (or whose camelCase form collides with) a
  reserved/base identifier: 'resources'/'resource'/'results' (validator param),
  or 'home_region' (-> homeRegion collides with the base OciTerraformResource).
  When unsure, drop the attribute.
Then regenerate: 'cd ocd && npm run compile-for-codegen && npm run
import-and-generate-oci --workspace=packages/codegen-cli'. Then VERIFY the FULL
build (not just model): 'cd ocd && npm run build --workspace=packages/model
--workspace=packages/export --workspace=packages/import --workspace=packages/react'
must exit 0 — the export build catches base-property collisions the model build
misses. If it fails, fix or drop the offending attribute and re-verify before
finishing. Update the Progress section of $NOTES with the services added + new
count. Do NOT commit, do NOT run the appdmg-breaking plain 'npm run build' at the
ocd root, do NOT npm install. ONLY if you curated ZERO services this run because no further
high-value services remain, output ${COMPLETION_SIGNAL} ALONE on its own final
line and nothing else on that line. If you curated any services, do NOT output
that token anywhere (not even negated)."
  OUT=$(printf '%s' "$PROMPT" | claude -p --permission-mode acceptEdits \
    --allowedTools "Read,Edit,Write,Glob,Grep,Bash")

  echo "$OUT" | tail -20

  # Match the signal ONLY as a standalone whole line (grep -x), so a negated
  # mention in prose ("this is NOT A2_CATALOG_COMPLETE") doesn't falsely trigger
  # completion and discard a valid curated batch.
  if echo "$OUT" | grep -qxF "$COMPLETION_SIGNAL"; then
    echo "Completion signal received — catalog curation complete. Stopping."
    break
  fi

  echo "--- verify (gate-aware) ---"
  if ! verify; then
    # The gate can flake if it races codegen settling. Re-verify ONCE before
    # treating the failure as real (a genuinely broken batch fails twice).
    echo "verify failed; re-running once (gate can race codegen settle)..."
    sleep 5
    if ! verify; then
      echo "VERIFY FAILED (twice) on iteration $i. Stopping so the broken batch does not compound."
      echo "--- last 30 lines of .a2-verify.log ---"; tail -30 .a2-verify.log 2>/dev/null
      echo "Inspect the working tree, fix or 'git checkout -- .', then resume."
      exit 1
    fi
  fi

  COUNT=$(node -e "const s=require('./ocd/packages/codegen-cli/schema/oci-schema.json');console.log(Array.isArray(s)?s.length:Object.keys(s).length)" 2>/dev/null || echo '?')
  git add ocd/packages/codegen/src/importer/data/OciResourceMap.ts \
          ocd/packages/codegen-cli/schema/oci-schema.json \
          ocd/packages/model ocd/packages/export ocd/packages/import ocd/packages/react \
          "$NOTES"
  git commit -q -m "feat(oci): A2 curation batch (iteration $i, catalog -> ${COUNT})" \
    && echo "committed iteration $i (catalog: $COUNT resources)"
done

echo "=== loop finished. Review commits, then push with: ECC_SKIP_PREPUSH=1 git push ==="
