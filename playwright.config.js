import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/playwright",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: [
    {
      command: "npm run preview:test",
      url: "http://127.0.0.1:4173",
      reuseExistingServer: !process.env.CI
    },
    {
      command: "npm run storybook -- --ci --port 6006",
      url: "http://127.0.0.1:6006",
      reuseExistingServer: !process.env.CI
    }
  ]
})
