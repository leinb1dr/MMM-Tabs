import { test, expect } from "@playwright/test"

test.describe("MMM-Tabs fixture page", () => {
  test("displays the current page name", async ({ page }) => {
    await page.goto("/?scenario=home")

    await expect(page.locator(".mmm-tabs-current")).toHaveText("Home")
  })

  test("lists additional pages in the dropdown", async ({ page }) => {
    await page.goto("/?scenario=home")

    const options = page.locator(".mmm-tabs-select option")
    await expect(options).toHaveCount(2)
    await expect(options.nth(0)).toHaveText("Calendar")
    await expect(options.nth(1)).toHaveText("Weather")
  })

  test("updates selection when a different page is chosen", async ({ page }) => {
    await page.goto("/?scenario=home")

    await page.selectOption(".mmm-tabs-select", "2")
    await expect(page.locator("#selected-page")).toHaveText("2")
  })

  test("hides the dropdown when only one page exists", async ({ page }) => {
    await page.goto("/?scenario=single")

    await expect(page.locator(".mmm-tabs-current")).toHaveText("Dashboard")
    await expect(page.locator(".mmm-tabs-select")).toHaveCount(0)
  })

  test("shows the active page name for non-zero pages", async ({ page }) => {
    await page.goto("/?scenario=calendar")

    await expect(page.locator(".mmm-tabs-current")).toHaveText("Calendar")
    await expect(page.locator(".mmm-tabs-select option")).toHaveCount(2)
  })
})
