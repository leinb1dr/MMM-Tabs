import { test, expect } from "@playwright/test"

const storybookBaseUrl = "http://127.0.0.1:6006"

test.describe("MMM-Tabs Storybook", () => {
  test("renders the Home Page story", async ({ page }) => {
    await page.goto(`${storybookBaseUrl}/iframe.html?id=mmm-tabs--home-page`)

    await expect(page.locator(".mmm-tabs-select option:checked")).toHaveText("Home")
    await expect(page.locator(".mmm-tabs-select option")).toHaveCount(3)
  })

  test("renders the Calendar Page story", async ({ page }) => {
    await page.goto(`${storybookBaseUrl}/iframe.html?id=mmm-tabs--calendar-page`)

    await expect(page.locator(".mmm-tabs-select option:checked")).toHaveText("Calendar")
  })

  test("renders the Single Page story without a dropdown", async ({ page }) => {
    await page.goto(`${storybookBaseUrl}/iframe.html?id=mmm-tabs--single-page`)

    await expect(page.locator(".mmm-tabs-current")).toHaveText("Dashboard")
    await expect(page.locator(".mmm-tabs-select")).toHaveCount(0)
  })
})
