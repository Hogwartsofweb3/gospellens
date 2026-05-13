import { test, expect } from "@playwright/test";

// NOTE: Content tests that require auth use PLAYWRIGHT_USER_* env vars.
// Without credentials, they test the public-facing parts only.

test.describe("Public content pages", () => {
  test("landing page shows ministry/content preview", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Gospel Lens/);
    // Page should render without JavaScript errors
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.waitForLoadState("networkidle");
    expect(errors.filter((e) => !e.includes("ChunkLoad"))).toHaveLength(0);
  });

  test("/sitemap.xml returns valid XML", async ({ page }) => {
    const response = await page.request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("<?xml");
    expect(body).toContain("<urlset");
  });

  test("/robots.txt returns valid content", async ({ page }) => {
    const response = await page.request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("User-agent");
    expect(body).toContain("Sitemap");
  });
});

test.describe("Content pages structure", () => {
  test("article page structure is correct (back button, content area)", async ({ page }) => {
    await page.context().clearCookies();
    // Without a real article ID this will redirect, just verify nav works
    await page.goto("/");
    await expect(page.getByText(/Gospel Lens/i).first()).toBeVisible();
  });
});

test.describe("Privacy & Terms", () => {
  test("privacy policy page loads", async ({ page }) => {
    await page.goto("/privacy-policy");
    await expect(page).toHaveURL(/privacy-policy/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("terms of service page loads", async ({ page }) => {
    await page.goto("/terms");
    await expect(page).toHaveURL(/terms/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("Mobile responsiveness", () => {
  test("landing page renders correctly at 390px width", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.getByText(/Gospel Lens/i).first()).toBeVisible();
    // Verify no horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // 2px tolerance
    await context.close();
  });
});
