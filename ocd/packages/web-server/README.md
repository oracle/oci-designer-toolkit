# @ocd/web-server

A small, **localhost-only, read-only** Node backend that lets the OCD **web (browser)**
build perform OCI discovery — *import-from-OCI* and *Reference Data Query* — the same way
the Electron desktop build does through its main process.

Browsers cannot read `~/.oci/config` and cannot call the OCI SDK directly (CORS). This
service reads the config **server-side** and reuses the existing `@ocd/query` package
(`OciQuery` / `OciReferenceDataQuery`, which use `oci-sdk` +
`ConfigFileAuthenticationDetailsProvider`). The Electron path is unchanged; this is only
used when the renderer is served in a plain browser (no `window.ocdAPI`).

## Endpoints

All responses use the envelope `{ "success": boolean, "data"?: ..., "error"?: string }`.

| Method | Path                   | Purpose                                                        |
|--------|------------------------|----------------------------------------------------------------|
| GET    | `/api/oci/health`      | Liveness probe.                                                |
| GET    | `/api/oci/profiles`    | Profile names from `~/.oci/config` → `{ profiles: string[] }`. |
| GET    | `/api/oci/profile?profile=NAME` | Non-sensitive key/values for one profile.             |
| GET    | `/api/oci/regions?profile=NAME` | Subscribed regions for the profile's tenancy.         |
| GET    | `/api/oci/compartments?profile=NAME` | Tenancy compartments (incl. root).               |
| POST   | `/api/oci/query`       | Body `{ profile, region, compartmentIds }` → discovered resources. |
| POST   | `/api/oci/dropdown`    | Body `{ profile, region }` → reference / dropdown data.        |

`GET /api/oci/profiles` returns a clear JSON error such as
`{"success":false,"error":"No OCI profiles found in ~/.oci/config"}` when the config is
missing or empty, so the browser dialog can display it instead of failing silently.

## Running it

Requires a valid `~/.oci/config` on the machine running the backend.

```bash
# 1. Build the server (compiles TypeScript to lib/esm)
cd ocd
npm run build --workspace=packages/web-server      # or: npm run web-server-dev

# 2. Start the backend (binds 127.0.0.1:5050 by default)
npm run web-server                                  # node lib/esm/server.js

# 3. In another terminal, start the web dev server
npm run web                                         # vite dev server (renderer)
```

The Vite dev server proxies `/api/oci/*` to this backend (see
`packages/desktop/vite.renderer.config.mts`), so the browser app calls a same-origin path
and the backend handles the OCI SDK calls.

### Configuration

| Env var                 | Default                 | Purpose                                              |
|-------------------------|-------------------------|------------------------------------------------------|
| `OCD_WEB_SERVER_PORT`   | `5050`                  | Port the backend binds on (`127.0.0.1` only).        |
| `OCD_WEB_SERVER_URL`    | `http://127.0.0.1:5050` | Used by the Vite proxy target if you change the port. |

If you change the port, set both so the proxy still resolves:

```bash
OCD_WEB_SERVER_PORT=5071 npm run web-server
OCD_WEB_SERVER_URL=http://127.0.0.1:5071 npm run web
```

## Security notes

- **Loopback only.** The server binds `127.0.0.1` and is never exposed off-host.
- **Read-only.** Only list/query operations are exposed. No create/update/apply
  (Resource Manager stack creation stays in the Electron path).
- **No secrets in responses.** Credential-bearing config keys (`key_file`,
  `security_token_file`, `pass_phrase`/`passphrase`, `fingerprint`, `cert-bundle`) are
  stripped from `/api/oci/profile`. Profile/credential values are never logged.
- **Bounded requests.** Request bodies are capped (1 MiB) and tenancy queries inherit the
  `@ocd/query` timeout so an unreachable endpoint rejects with a JSON error instead of
  hanging.
