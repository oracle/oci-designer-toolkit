import { test, expect } from '@playwright/test'

test.describe('Architecture Agent smoke', () => {
  test('generates an OCI architecture from chat and applies it to the designer', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.ocd-console')).toBeVisible({ timeout: 20_000 })

    // Two "AI Architect" buttons exist (the console hero CTA and the command-bar
    // action). Scope to the hero CTA to avoid a strict-mode clash.
    const agentButton = page.locator('.ocd-agent-cta')
    await expect(agentButton).toBeVisible({ timeout: 10_000 })
    await agentButton.click()

    await expect(page.getByRole('heading', { name: 'Architecture Agent' })).toBeVisible({ timeout: 30_000 })
    await expect(page.getByRole('heading', { name: 'Reasoning proposes' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Policy decides' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Agentic Zero Trust' })).toBeVisible()

    await page.getByLabel('Architecture request').fill(
      'Create a secure OKE platform with a private worker subnet, pod subnet, vault, logging, monitoring, and budget controls.',
    )
    await page.getByRole('button', { name: 'Generate plan' }).click()

    await expect(page.getByRole('heading', { name: 'Agent OKE Platform Architecture' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'OKE Enhanced Cluster' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'oke_cluster' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'OKE Private Node Pool' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'oke_node_pool' })).toBeVisible()

    await page.getByRole('button', { name: 'Apply to designer' }).click()

    await expect(page.locator('#ocd_document_title')).toHaveValue('Agent OKE Platform Architecture')
    await expect(page.locator('.ocd-designer')).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('.ocd-designer-resource').first()).toBeVisible({ timeout: 20_000 })
  })
})
