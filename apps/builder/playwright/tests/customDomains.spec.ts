import test, { expect } from '@playwright/test'
import { InputStepType, defaultTextInputOptions } from 'models'
import { createTypebots, parseDefaultBlockWithStep } from '../services/database'
import { generate } from 'short-uuid'
import path from 'path'

const typebotId = generate()
test.describe('Dashboard page', () => {
  test('should be able to connect custom domain', async ({ page }) => {
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultBlockWithStep({
          type: InputStepType.TEXT,
          options: defaultTextInputOptions,
        }),
      },
    ])

    await page.goto(`/typebots/${typebotId}/share`)
    await page.click('text=Add my domain')
    await page.click('text=Connect new')
    await page.fill('input[placeholder="bot.my-domain.com"]', 'test')
    await expect(page.locator('text=Save')).toBeDisabled()
    await page.fill('input[placeholder="bot.my-domain.com"]', 'yolozeeer.com')
    await expect(page.locator('text="A"')).toBeVisible()
    await page.fill(
      'input[placeholder="bot.my-domain.com"]',
      'sub.yolozeeer.com'
    )
    await expect(page.locator('text="CNAME"')).toBeVisible()
    await page.click('text=Save')
    await expect(
      page.locator('text="https://sub.yolozeeer.com/"')
    ).toBeVisible()
    await page.click('text="Edit" >> nth=1')
    await page.fill(
      'text=https://sub.yolozeeer.com/Copy >> input',
      'custom-path'
    )
    await page.press(
      'text=https://sub.yolozeeer.com/custom-path >> input',
      'Enter'
    )
    await expect(page.locator('text="custom-path"')).toBeVisible()
    await page.click('[aria-label="Remove custom domain"]')
    await expect(page.locator('text=sub.yolozeeer.com')).toBeHidden()
    await page.click('button >> text=Add my domain')
    await page.click('[aria-label="Remove domain"]')
    await expect(page.locator('[aria-label="Remove domain"]')).toBeHidden()
  })

  test.describe('Free user', () => {
    test.use({
      storageState: path.join(__dirname, '../freeUser.json'),
    })
    test("create folder shouldn't be available", async ({ page }) => {
      await page.goto(`/typebots/${typebotId}/share`)
      await page.click('text=Add my domain')
      await expect(page.locator('text=Upgrade now')).toBeVisible()
    })
  })
})
