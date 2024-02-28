/* eslint-disable no-restricted-syntax */
import { test, expect } from '@playwright/test'

const shapes = ['Container', 'Rectangle', 'Ellipse', 'Polygon', 'Line', 'Text']

for (const shape of shapes) {
  test(`can create ${shape.toLowerCase()}`, async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Insert' }).click()
    await page.getByText(shape).click()
    await expect(page.locator('#top-menu')).toContainText('saved')
    await expect(page).toHaveScreenshot()
  })
}
