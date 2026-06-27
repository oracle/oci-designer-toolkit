import { test, expect } from '@playwright/test'

test.describe('OKIT Classic parity smoke', () => {
  test('opens the Classic 0.70 parity workbench and shows mapped capabilities', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.ocd-console')).toBeVisible({ timeout: 20_000 })

    const classicButton = page.getByRole('button', { name: 'Classic 0.70' })
    await expect(classicButton).toBeVisible({ timeout: 10_000 })
    await classicButton.click()

    await expect(page.getByRole('heading', { name: 'OKIT Classic 0.70 Parity' })).toBeVisible({ timeout: 30_000 })
    await expect(page.getByLabel('Classic parity summary')).toContainText('7 enhanced')
    await expect(page.getByLabel('Classic parity summary')).toContainText('7 available')
    await expect(page.getByLabel('Classic parity summary')).toContainText('1 partial')

    await expect(page.getByRole('heading', { name: 'Landing Zone Next-Gen' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Discovery Workbench' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Expanded OCI service catalog' })).toBeVisible()

    await expect(page.getByRole('heading', { name: 'Views' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Freeform visual design canvas', exact: true })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Common Tags view', exact: true })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Terraform view', exact: true })).toBeVisible()

    await expect(page.getByRole('heading', { name: 'Import, Export, Query' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Image export', exact: true })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'OCI Resource Manager handoff', exact: true })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'OCI query and introspection', exact: true })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Portable JSON model', exact: true })).toBeVisible()
  })
})
