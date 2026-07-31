import { test, expect } from "@playwright/test"

const storybookBaseUrl = "http://127.0.0.1:6006"

test.describe("MMM-Tabs Storybook", () => {
  test("renders the Home Page story", async ({ page }) => {
    await page.goto(`${storybookBaseUrl}/iframe.html?id=mmm-tabs--home-page`)

    await expect(page.locator(".mmm-tabs-label")).toHaveText("Home")
    await expect(page.locator(".mmm-tabs-option")).toHaveCount(3)
    await expect(page.locator(".mmm-tabs-option[aria-selected=\"true\"]")).toHaveText("Home")
  })

  test("renders the Calendar Page story", async ({ page }) => {
    await page.goto(`${storybookBaseUrl}/iframe.html?id=mmm-tabs--calendar-page`)

    await expect(page.locator(".mmm-tabs-label")).toHaveText("Calendar")
    await expect(page.locator(".mmm-tabs-option[aria-selected=\"true\"]")).toHaveText("Calendar")
  })

  test("renders the Single Page story without a dropdown", async ({ page }) => {
    await page.goto(`${storybookBaseUrl}/iframe.html?id=mmm-tabs--single-page`)

    await expect(page.locator(".mmm-tabs-current")).toHaveText("Dashboard")
    await expect(page.locator(".mmm-tabs-dropdown")).toHaveCount(0)
  })

  test("renders the open dropdown story with MagicMirror colors", async ({ page }) => {
    await page.goto(`${storybookBaseUrl}/iframe.html?id=mmm-tabs--open-dropdown`)

    const menu = page.locator(".mmm-tabs-menu")
    await expect(menu).toBeVisible()
    await expect(menu).toHaveCSS("background-color", "rgb(0, 0, 0)")
    await expect(page.locator(".mmm-tabs-option[aria-selected=\"true\"]")).toHaveCSS("color", "rgb(255, 255, 255)")
  })
})
