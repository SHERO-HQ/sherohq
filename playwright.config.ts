import { defineConfig, devices } from "@playwright/test";

// Browser checks against a production build: accessibility (e2e/a11y.spec.ts)
// and the screenshots for the review page (scripts/review-shots.ts).
// PW_CHROMIUM_PATH lets environments with a preinstalled Chromium use it.
const executablePath = process.env.PW_CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: "http://localhost:3100",
    launchOptions: { executablePath },
  },
  projects: [
    { name: "admin-setup", testMatch: /admin\.setup\.ts/ },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
      dependencies: ["admin-setup"],
    },
    { name: "mobile", use: { ...devices["Pixel 7"], launchOptions: { executablePath } }, dependencies: ["admin-setup"] },
  ],
  webServer: {
    command: "yarn start -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
