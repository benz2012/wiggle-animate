/* eslint-disable no-restricted-syntax */
import { test, expect } from '@playwright/test'

const shapes = ['Container', 'Rectangle', 'Ellipse', 'Polygon', 'Line', 'Text']

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.addInitScript(() => {
    window.localStorage.setItem('wiggle.animate.autosaveToBrowser', 'false')
  })
  await page.reload()
})

for (const shape of shapes) {
  test(`can create ${shape.toLowerCase()}`, async ({ page }) => {
    await page.getByRole('button', { name: 'Insert' }).click()
    await page.getByText(shape).click()
    await expect(page).toHaveScreenshot()
  })
}
