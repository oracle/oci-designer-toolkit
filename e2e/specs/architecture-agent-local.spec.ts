/*
 * Architecture Agent — LOCAL planner smoke test.
 *
 * This complements architecture-agent.spec.ts WITHOUT duplicating it. The
 * existing spec types a custom OKE prompt, generates with the default planner,
 * and applies the result to the Designer canvas. This spec instead exercises a
 * different slice of the LOCAL deterministic planner:
 *   - the prompt-template buttons (no typing),
 *   - the planner <select> set explicitly to "Local deterministic",
 *   - the offline readiness banner (no API key required),
 *   - the generated plan metrics, AND
 *   - the non-empty Terraform package preview block.
 *
 * The local planner is deterministic and makes no network calls, so this runs
 * fully offline. Every assertion targets only what the LOCAL path produces.
 *
 * Plan determinism:
 *   The "Three-tier app" template prompt ("…three tier OCI web application…")
 *   routes through createArchitecturePlanFromPrompt → buildThreeTierPlan, which
 *   always yields the title "Agent Three-Tier Web Architecture" with a public
 *   load balancer and a private database tier. We assert those stable outputs.
 *
 * Selector strategy:
 *   Stable ARIA roles (button, heading, cell, status), aria-labels owned by the
 *   page (Architecture planner, Generated plan metrics, Terraform package
 *   preview), and visible text — no content-hash-dependent selectors.
 */

import { test, expect } from '@playwright/test'

test.describe('Architecture Agent — local planner', () => {
  test('uses a template + local planner to render a plan, metrics, and a Terraform preview', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.ocd-console')).toBeVisible({ timeout: 20_000 })

    // Two "AI Architect" buttons exist (the console hero CTA and the command-bar
    // action). Scope to the hero CTA to avoid a strict-mode clash.
    const agentButton = page.locator('.ocd-agent-cta')
    await expect(agentButton).toBeVisible({ timeout: 10_000 })
    await agentButton.click()

    await expect(page.getByRole('heading', { name: 'Architecture Agent' })).toBeVisible({ timeout: 30_000 })

    /* ── Local planner is selected and reports ready (no key, fully offline) ── */
    const plannerSelect = page.getByLabel('Architecture planner')
    await expect(plannerSelect).toBeVisible()
    await plannerSelect.selectOption('local')
    await expect(page.getByRole('status')).toContainText('Local planner is ready')

    /* ── Drive a prompt template button instead of typing a prompt ── */
    await page.getByRole('button', { name: 'Three-tier app' }).click()

    /* ── Generate with the deterministic local planner ── */
    const generateButton = page.getByRole('button', { name: 'Generate plan' })
    await expect(generateButton).toBeEnabled()
    await generateButton.click()

    /* ── The three-tier plan renders with its stable title + resource table ── */
    await expect(page.getByRole('heading', { name: 'Agent Three-Tier Web Architecture' })).toBeVisible({ timeout: 15_000 })
    // exact: true — "Public Load Balancer" / "Application Database" are also
    // substrings of their companion subnet rows ("… Subnet").
    await expect(page.getByRole('cell', { name: 'Public Load Balancer', exact: true })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'load_balancer', exact: true })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Application Database', exact: true })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'db_system', exact: true })).toBeVisible()

    /* ── Plan metrics: a non-zero resource count was derived from the plan ── */
    const metrics = page.getByLabel('Generated plan metrics')
    await expect(metrics).toBeVisible()
    await expect(metrics).toContainText('Resources')
    const resourcesArticle = metrics.locator('article').filter({ hasText: 'Resources' }).first()
    const resourceCountText = (await resourcesArticle.locator('strong').textContent())?.trim() ?? ''
    expect(Number(resourceCountText), 'local plan should report at least one resource').toBeGreaterThan(0)

    /* ── Terraform package preview: non-empty summary + at least one .tf file ── */
    const terraformPreview = page.getByLabel('Terraform package preview')
    await expect(terraformPreview).toBeVisible()
    await expect(terraformPreview).toContainText(/Terraform files/)
    await expect(
      terraformPreview.locator('span').filter({ hasText: /\.tf\b/ }).first(),
    ).toBeVisible()
  })
})
