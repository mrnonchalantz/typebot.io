import test, { expect } from '@playwright/test'
import {
  createTypebots,
  parseDefaultBlockWithStep,
} from '../../services/database'
import { defaultUrlInputOptions, InputStepType } from 'models'
import { typebotViewer } from '../../services/selectorUtils'
import { generate } from 'short-uuid'

test.describe('Url input step', () => {
  test('options should work', async ({ page }) => {
    const typebotId = generate()
    await createTypebots([
      {
        id: typebotId,
        ...parseDefaultBlockWithStep({
          type: InputStepType.URL,
          options: defaultUrlInputOptions,
        }),
      },
    ])

    await page.goto(`/typebots/${typebotId}/edit`)

    await page.click('text=Preview')
    await expect(
      typebotViewer(page).locator(
        `input[placeholder="${defaultUrlInputOptions.labels.placeholder}"]`
      )
    ).toHaveAttribute('type', 'url')
    await expect(typebotViewer(page).locator(`button`)).toBeDisabled()

    await page.click(`text=${defaultUrlInputOptions.labels.placeholder}`)
    await page.fill('#placeholder', 'Your URL...')
    await expect(page.locator('text=Your URL...')).toBeVisible()
    await page.fill('#button', 'Go')
    await page.fill(
      `input[value="${defaultUrlInputOptions.retryMessageContent}"]`,
      'Try again bro'
    )

    await page.click('text=Restart')
    await typebotViewer(page)
      .locator(`input[placeholder="Your URL..."]`)
      .fill('https://https://test')
    await typebotViewer(page).locator('button >> text="Go"').click()
    await expect(
      typebotViewer(page).locator('text=Try again bro')
    ).toBeVisible()
    await typebotViewer(page)
      .locator(`input[placeholder="Your URL..."]`)
      .fill('https://website.com')
    await typebotViewer(page).locator('button >> text="Go"').click()
    await expect(
      typebotViewer(page).locator('text=https://website.com')
    ).toBeVisible()
  })
})
