import { test, expect } from "@playwright/test"

test.describe("MMM-Tabs fixture page", () => {
  test("displays the current page in the dropdown trigger", async ({ page }) => {
    await page.goto("/?scenario=home")

    await expect(page.locator(".mmm-tabs-label")).toHaveText("Home")
    await expect(page.locator(".mmm-tabs-option[aria-selected=\"true\"]")).toHaveText("Home")
    await expect(page.locator(".mmm-tabs-current")).toHaveCount(0)
  })

  test("lists all pages in the dropdown menu", async ({ page }) => {
    await page.goto("/?scenario=home")

    const options = page.locator(".mmm-tabs-option")
    await expect(options).toHaveCount(3)
    await expect(options.nth(0)).toHaveText("Home")
    await expect(options.nth(1)).toHaveText("Calendar")
    await expect(options.nth(2)).toHaveText("Weather")
  })

  test("updates selection when a different page is chosen", async ({ page }) => {
    await page.goto("/?scenario=home")

    await page.locator(".mmm-tabs-trigger").click()
    await expect(page.locator(".mmm-tabs-menu")).toBeVisible()
    await page.locator(".mmm-tabs-option[data-value=\"1\"]").click()
    await expect(page.locator("#selected-page")).toHaveText("1")
    await expect(page.locator(".mmm-tabs-label")).toHaveText("Calendar")
    await expect(page.locator(".mmm-tabs-option[aria-selected=\"true\"]")).toHaveText("Calendar")
    await expect(page.locator(".mmm-tabs-menu")).toBeHidden()
  })

  test("attaches click handlers using MagicMirror module-content lookup", async ({ page }) => {
    await page.goto("/?scenario=home")

    await expect(page.locator("#module_1_MMM-Tabs.module.MMM-Tabs .module-content .mmm-tabs-trigger")).toBeVisible()
    await page.locator("#module_1_MMM-Tabs .mmm-tabs-trigger").click()
    await expect(page.locator("#module_1_MMM-Tabs .mmm-tabs-dropdown")).toHaveClass(/open/)
  })

  test("hides the dropdown when only one page exists", async ({ page }) => {
    await page.goto("/?scenario=single")

    await expect(page.locator(".mmm-tabs-current")).toHaveText("Dashboard")
    await expect(page.locator(".mmm-tabs-dropdown")).toHaveCount(0)
  })

  test("shows the active page name for non-zero pages", async ({ page }) => {
    await page.goto("/?scenario=calendar")

    await expect(page.locator(".mmm-tabs-label")).toHaveText("Calendar")
    await expect(page.locator(".mmm-tabs-option[aria-selected=\"true\"]")).toHaveText("Calendar")
    await expect(page.locator(".mmm-tabs-option")).toHaveCount(3)
  })

  test("styles the open menu with MagicMirror theme colors", async ({ page }) => {
    await page.goto("/?scenario=home")

    await expect(page.locator(".mmm-tabs-trigger")).toHaveCSS("color", "rgb(255, 255, 255)")

    await page.locator(".mmm-tabs-trigger").click()

    const menu = page.locator(".mmm-tabs-menu")
    await expect(menu).toBeVisible()

    await expect(menu).toHaveCSS("background-color", "rgb(0, 0, 0)")
    await expect(page.locator(".mmm-tabs-option[aria-selected=\"true\"]")).toHaveCSS("color", "rgb(255, 255, 255)")
    await expect(page.locator(".mmm-tabs-option[data-value=\"1\"]")).toHaveCSS("color", "rgb(153, 153, 153)")
  })
})
