#!/usr/bin/env bash
#
# Redaction gate: scan added lines for OCIDs, public IPs, tenancy namespaces,
# and obvious secrets before they can reach this public fork.
#
# Modes:
#   (no args)              scan the STAGED diff (pre-commit usage)
#   --revs <rev-args...>   scan added lines across a commit range (pre-push
#                          usage), e.g.  check-redaction.sh --revs A..B
#                          or            check-redaction.sh --revs B --not --remotes
#
# Exit 0 = clean, exit 1 = blocked. FAILS CLOSED: if a scan errors, the commit is
# blocked rather than silently allowed. Override (for an intentional, reviewed
# commit of PUBLIC reference data) with:  ALLOW_OCIDS=1 git commit ...
#
# Patterns are POSIX ERE, portable across GNU grep / BSD grep / ugrep
# (no \b word boundaries, no empty alternations).
#
# NOTE: any example values in comments/tests for this gate must avoid matching
# the gate expressions themselves; spell sensitive prefixes with separators.
set -uo pipefail

# Added lines only (context-free), so unchanged pre-existing content in a touched
# file does not trip the gate.
if [ "${1:-}" = "--revs" ]; then
    shift
    SCOPE="outgoing commits"
    RAW="$(git log -p -U0 --diff-filter=ACM --format= "$@" 2>/dev/null || true)"
    DIFF="$(printf '%s\n' "$RAW" | grep -E '^\+' | grep -vE '^\+\+\+' || true)"
else
    SCOPE="staged changes"
    DIFF="$(git diff --cached --diff-filter=ACM -U0 | grep -E '^\+' | grep -vE '^\+\+\+' || true)"
fi
[ -z "$DIFF" ] && exit 0

fail=0
report() { printf '\n[redaction-gate] BLOCKED: %s\n' "$1" >&2; fail=1; }

# scan <pattern> <label> — block on match (rc 0) OR on grep error (rc >= 2).
scan() {
    local pattern="$1" label="$2" out rc
    out="$(printf '%s\n' "$DIFF" | grep -nE "$pattern" 2>/dev/null)"; rc=$?
    if [ "$rc" -ge 2 ]; then
        report "scan error for '$label' — failing closed"
    elif [ "$rc" -eq 0 ]; then
        report "$label"
        printf '%s\n' "$out" | head -10 >&2
    fi
}

SQ="'"  # single-quote char, for embedding in ERE bracket expressions below

[ "${ALLOW_OCIDS:-0}" = "1" ] || scan 'ocid1\.[a-z0-9]+\.oc[0-9]' "real OCID(s) in $SCOPE"
scan '(130\.61|161\.153|144\.24|129\.153|141\.147|82\.77|109\.166)\.[0-9]+\.[0-9]+' "real public IP(s) in $SCOPE"
# PEM private-key header variants plus internal service keys.
scan 'BEGIN [A-Z ]*PRIVATE KEY|isk_[0-9a-f]{30}' "private key / secret material in $SCOPE"
# Tenancy namespace strings (lowercase alnum, ~10-20 chars) are only flagged in
# context — OCIR registry paths (<region>.ocir.io/<ns>/...) and Object Storage
# URL segments (/n/<ns>/b/...). Placeholders like ${OCIR_TENANCY} or <NAMESPACE>
# do not match (contain $, {, <, uppercase).
scan 'ocir\.io/[a-z0-9]{10,20}/|/n/[a-z0-9]{10,20}/b/' "tenancy namespace string in OCIR / Object Storage path in $SCOPE"
# OCI auth-token literals: auth_token / auth-token / AUTH_TOKEN assigned an inline
# literal 14+ chars. Placeholders/interpolations ("<AUTH_TOKEN>", "${TOKEN}") are
# excluded by the value character class.
scan "(auth|AUTH)[_-]?(token|TOKEN)[\"$SQ]?[[:space:]]*[:=][[:space:]]*[\"$SQ]?[^\"$SQ<>\$[:space:]]{14,}" "OCI auth token literal in $SCOPE"

if [ "$fail" -ne 0 ]; then
    printf '\n[redaction-gate] Blocked. Replace the values above with <PLACEHOLDER> tokens,\n' >&2
    printf '[redaction-gate] or for intentional PUBLIC reference data: ALLOW_OCIDS=1 git commit/push ...\n' >&2
    exit 1
fi
exit 0
