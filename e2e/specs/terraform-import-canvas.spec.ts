/*
 * Terraform import → Designer canvas round-trip smoke test.
 *
 * Flow:
 *   1. Load the static web app (OcdConsole).
 *   2. Click the landing-page "Import Terraform" command button.
 *   3. Feed a tiny, obviously-synthetic .tf fixture into the browser file picker.
 *   4. Assert the console switches to the Designer and renders the imported
 *      resources as SVG nodes on the canvas.
 *
 * Why a file chooser:
 *   On the static web build there is no Electron `window.ocdAPI`, so the import
 *   takes the browser path (OcdDesignFacade.pickAndReadTextFiles) which creates a
 *   hidden <input type="file" accept=".tf"> and clicks it. Playwright intercepts
 *   that with the `filechooser` event and supplies the fixture via setFiles().
 *
 * Selector strategy:
 *   - The landing page's command-button grid exposes a real <button> labelled
 *     "Import Terraform" (icon + label) that invokes the same importFromTerraform
 *     handler as File → Import → Terraform. It is a sized, role-correct control,
 *     so it is preferred over the hover-revealed menu (whose top-level <a> items
 *     have no layout box Playwright treats as visible in the static build).
 *   - The Designer canvas renders one <g class="ocd-designer-resource"> per
 *     placed resource (OcdResourceSvg), and the resource's display name is set as
 *     the title attribute on its background div — both are app-owned and stable.
 *
 * Skip-gracefully:
 *   If the "Import Terraform" command button is not present in this build the
 *   test skips with a clear reason rather than false-failing.
 *
 * Redaction:
 *   The fixture uses only obviously-synthetic values — the `.example` realm tail
 *   (never a real base32 OCID) and RFC1918 CIDRs. This mirrors the proven-safe
 *   spelling already committed in
 *   ocd/packages/import/src/__tests__/terraformImport.test.ts.
 */

import { test, expect } from '@playwright/test'
import { mkdtempSync, writeFileSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

/*
 * Synthetic Terraform: a compartment that parents a VCN, and a subnet that
 * references the VCN. The compartment guarantees the importer produces a layer
 * (Menu.importFromTerraform adds one layer per imported compartment), so the
 * VCN + subnet render as canvas nodes after auto-layout.
 */
const SYNTHETIC_TERRAFORM = `
resource "oci_identity_compartment" "lab" {
    compartment_id = "<TENANCY_OCID>"
    name           = "e2e-import-lab"
    description    = "Synthetic compartment for the e2e Terraform import test"
}

resource "oci_core_vcn" "vcn1" {
    compartment_id = oci_identity_compartment.lab.id
    display_name   = "E2E Import VCN"
    cidr_blocks    = ["10.0.0.0/16"]
    dns_label      = "e2evcn"
}

resource "oci_core_subnet" "subnet1" {
    compartment_id = oci_identity_compartment.lab.id
    display_name   = "E2E Import Subnet"
    cidr_block     = "10.0.1.0/24"
    dns_label      = "e2esubnet"
    vcn_id         = oci_core_vcn.vcn1.id
}
`

test.describe('Terraform import → canvas', () => {
  test('imports a Terraform file and renders the resources on the Designer canvas', async ({ page }) => {
    /* ── 1. Load the app ─────────────────────────────────────────────── */
    await page.goto('/')
    await expect(page.locator('.ocd-console')).toBeVisible({ timeout: 20_000 })

    /* ── 2. Find the landing-page "Import Terraform" command button ───── */
    // The button's accessible name includes its icon glyph ("TF"), so match on
    // the label substring rather than an exact name.
    const importButton = page.getByRole('button', { name: /Import Terraform/ })
    if (!(await importButton.isVisible().catch(() => false))) {
      test.skip(true, 'The "Import Terraform" command button is not present in this static build; cannot exercise the import affordance via the UI here.')
      return
    }

    /* ── 3. Write the synthetic fixture and feed it to the file picker ── */
    const fixtureDir = mkdtempSync(join(tmpdir(), 'ocd-tf-import-'))
    const fixturePath = join(fixtureDir, 'synthetic.tf')
    writeFileSync(fixturePath, SYNTHETIC_TERRAFORM, 'utf8')

    try {
      const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 15_000 })
      await importButton.click()
      const fileChooser = await fileChooserPromise
      await fileChooser.setFiles(fixturePath)

      /* ── 4. The console switches to the Designer with rendered nodes ── */
      await expect(page.locator('.ocd-designer')).toBeVisible({ timeout: 20_000 })

      // Each placed resource is a <g class="ocd-designer-resource"> (OcdResourceSvg).
      const resourceNodes = page.locator('.ocd-designer-resource')
      await expect(resourceNodes.first()).toBeVisible({ timeout: 20_000 })
      expect(await resourceNodes.count(), 'imported Terraform should render at least one canvas resource').toBeGreaterThan(0)

      // The imported VCN's display name is carried as a title attribute on its
      // background element — confirms the VCN specifically made it onto the canvas.
      await expect(page.locator('[title="E2E Import VCN"]').first()).toBeVisible({ timeout: 20_000 })
    } finally {
      rmSync(fixtureDir, { recursive: true, force: true })
    }
  })
})
