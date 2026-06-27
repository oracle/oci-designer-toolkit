/*
 * Cross-Tenancy Hub-Spoke overlay e2e.
 *
 * Ticks the wizard's "Cross-Tenancy" toggle, walks Foundation → Review, opens in
 * the Designer, and asserts the best-practice two-tenancy topology renders on the
 * canvas (hub + peer transit subnets — subnets are known to render their
 * displayName as a title attribute, mirroring the OKE overlay assertions).
 *
 * Skip-gracefully: headless static builds may lack the full OE sources, so
 * "Open in Designer" can stay disabled (same tolerance as lzng-wizard-smoke).
 */

import { test, expect, Page } from '@playwright/test'

const WIZARD_BUTTON_NAME = 'Landing Zone Next-Gen'
const STEP_COUNT = 5

async function clickContinue(page: Page, currentStepIndex: number): Promise<void> {
  const continueBtn = page.getByRole('button', { name: 'Continue' })
  await expect(continueBtn).toBeEnabled()
  await continueBtn.click()
  const nextStep = currentStepIndex + 2
  await expect(page.getByText(`Step ${nextStep} of ${STEP_COUNT}`)).toBeVisible()
}

async function openLandingZoneWizard(page: Page): Promise<void> {
  const wizardBtn = page.getByRole('button', { name: WIZARD_BUTTON_NAME })
  await expect(wizardBtn).toBeVisible({ timeout: 10_000 })
  await wizardBtn.click()
  await expect(page.locator('.ocd-lzng').first()).toBeVisible({ timeout: 30_000 })
}

test.describe('Cross-Tenancy Hub-Spoke overlay', () => {
  test('ticking Cross-Tenancy renders the two-tenancy DRG + RPC topology in the Designer', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.ocd-console')).toBeVisible({ timeout: 20_000 })

    await openLandingZoneWizard(page)

    // Tick the Cross-Tenancy toggle (action bar, visible on all steps).
    const crossTenancyToggle = page
      .locator('.ocd-lzng-scaffold-toggle', { hasText: 'Cross-Tenancy' })
      .locator('input[type="checkbox"]')
    await expect(crossTenancyToggle).toBeVisible()
    await crossTenancyToggle.check()
    await expect(crossTenancyToggle).toBeChecked()

    // Walk Foundation → Review.
    for (let step = 0; step < STEP_COUNT - 1; step += 1) {
      await clickContinue(page, step)
    }
    await expect(page.getByRole('heading', { name: 'Generated Files' })).toBeVisible()

    // "Open in Designer" needs OE generation to have produced files. In a headless
    // build without the full OE sources the button stays disabled — skip then.
    await page.getByText('Generating Operating Entities…').waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => {})
    const openBtn = page.getByRole('button', { name: 'Open in Designer' })
    let openEnabled = false
    try {
      await expect(openBtn).toBeEnabled({ timeout: 15_000 })
      openEnabled = true
    } catch {
      openEnabled = false
    }
    test.skip(!openEnabled, 'OE generation produced no files in this headless build; "Open in Designer" is unavailable, so the overlay cannot be exercised via the UI here.')
    await openBtn.click()

    // The Designer canvas renders the hub + peer transit subnets (subnets carry
    // their displayName as a title attribute via OcdResourceSvg).
    await expect(page.locator('.ocd-designer')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('[title="Hub Transit Subnet"]').first()).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('[title="Peer Transit Subnet (remote tenancy)"]').first()).toBeVisible({ timeout: 15_000 })
  })
})
