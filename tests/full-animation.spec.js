import { test, expect } from '@playwright/test'

const cx = (x) => (x / 2) + 275
const cy = (y) => (y / 2) + 111
const cp = (x, y) => ({ x: cx(x), y: cy(y) })

const clickAndDrag = async (page, from, to) => {
  console.log(from, to)
  await page.locator('#stage').hover({ position: from })
  await page.mouse.down()
  // We need this wait here because some of our drag actions we purposfully ignore
  // because a user would trigger "micro-movements" otherwise onMouseDown
  await page.waitForTimeout(100)
  await page.locator('#stage').hover({ position: to })
  await page.mouse.up()
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.addInitScript(() => {
    let incremetor = -10
    Math.random = () => { incremetor += 10; return ((incremetor % 99) / 99) }
    window.localStorage.setItem('wiggle.animate.autosaveToBrowser', 'false')
  })
  await page.reload()
})

test('can create animation', async ({ page }) => {
  await page.getByRole('button', { name: 'Insert' }).click()
  await page.getByText('Rectangle').click()

  await clickAndDrag(page, cp(960, 540), cp(50, 50))
})
