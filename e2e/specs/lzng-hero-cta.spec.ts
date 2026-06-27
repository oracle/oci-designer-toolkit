/*
 * Landing Zone Next-Gen hero CTA spec.
 *
 * Verifies the promoted hero entry-point introduced in v0.4.5.1:
 *   1. The `.ocd-lz-hero-cta` button is visible on the OcdConsole home page.
 *   2. Its label reads exactly "Landing Zone Next-Gen".
 *   3. Clicking it navigates into the Landing Zone wizard (`.ocd-lzng` outer
 *      div appears; the wizard stepper is rendered).
 *
 * The CTA is a labeled red pill that replaced the 15px toolbar icon as the
 * primary wizard entry point. It sets `displayPage = 'landingzone'` which
 * lazy-loads OcdLandingZone.
 *
 * Selector strategy (mirrors lzng-wizard-smoke.spec.ts conventions):
 *   - CSS class selectors (.ocd-lz-hero-cta, .ocd-lzng) for stable structural
 *     elements defined in @ocd/react source.
 *   - ARIA roles + text for label assertions — no brittle DOM-path selectors.
 *   - Deterministic waits (toBeVisible with explicit timeout) rather than
 *     arbitrary sleep().
 *
 * Requires the same pre-built static web-dist used by the smoke tests:
 *   cd ocd && OCD_PAGES_BASE=/ npm run build:pages
 *   cd e2e && npx playwright test
 *
 * Or, from the repo root:
 *   npm run test:e2e          (uses existing web-dist)
 *   npm run test:e2e:build-first  (rebuilds first)
 */

import { test, expect } from '@playwright/test'

test.describe('Landing Zone Next-Gen hero CTA', () => {
  test('hero CTA is visible with correct label on the console home page', async ({ page }) => {
    /* ── 1. Load the app ─────────────────────────────────────────────── */
    await page.goto('/')
    await expect(page.locator('.ocd-console')).toBeVisible({ timeout: 20_000 })

    /* ── 2. The hero CTA button is present ───────────────────────────── */
    const heroCta = page.locator('.ocd-lz-hero-cta')
    await expect(heroCta).toBeVisible({ timeout: 10_000 })

    /* ── 3. Its label text is "Landing Zone Next-Gen" ────────────────── */
    // The label is in a child <span class="ocd-lz-hero-cta-label">; check via
    // locator text so the assertion is resilient to minor DOM structure changes.
    const ctaLabel = heroCta.locator('.ocd-lz-hero-cta-label')
    await expect(ctaLabel).toBeVisible()
    await expect(ctaLabel).toHaveText('Landing Zone Next-Gen')

    /* ── 4. The button is enabled (not disabled/aria-disabled) ───────── */
    await expect(heroCta).toBeEnabled()
  })

  test('clicking the hero CTA opens the Landing Zone wizard', async ({ page }) => {
    /* ── 1. Load the app ─────────────────────────────────────────────── */
    await page.goto('/')
    await expect(page.locator('.ocd-console')).toBeVisible({ timeout: 20_000 })

    /* ── 2. Confirm we are NOT already in the wizard ─────────────────── */
    await expect(page.locator('.ocd-lzng').first()).not.toBeVisible()

    /* ── 3. Click the hero CTA ───────────────────────────────────────── */
    const heroCta = page.locator('.ocd-lz-hero-cta')
    await expect(heroCta).toBeVisible({ timeout: 10_000 })
    await heroCta.click()

    /* ── 4. Wizard outer div appears (lazy-loaded OcdLandingZone) ─────── */
    // .ocd-lzng is the root element of OcdLandingZone — always in the build.
    // data-testid='lzng-wizard' is the same element (after @ocd/react rebuild).
    await expect(page.locator('.ocd-lzng').first()).toBeVisible({ timeout: 30_000 })

    /* ── 5. The stepper nav is rendered ──────────────────────────────── */
    // LzngStepper renders a <nav aria-label="Wizard steps"> on every step.
    await expect(page.getByRole('navigation', { name: 'Wizard steps' })).toBeVisible()

    /* ── 6. Foundation step is the active first step ─────────────────── */
    // The active step carries aria-current="step".
    await expect(page.locator('[aria-current="step"]')).toContainText('Foundation')

    /* ── 7. Step subtitle confirms we are at step 1 of 5 ─────────────── */
    await expect(page.getByText('Step 1 of 5')).toBeVisible()
  })
})
