import { test, expect } from "@playwright/test";

// NOTE: These tests run against a live dev server.
// For full auth flows, set PLAYWRIGHT_USER_EMAIL and PLAYWRIGHT_USER_PASSWORD env vars.

const TEST_EMAIL = process.env.PLAYWRIGHT_USER_EMAIL || "test@gospellens.app";
const TEST_PASSWORD = process.env.PLAYWRIGHT_USER_PASSWORD || "testpassword123";

test.describe("Sign up flow", () => {
  test("landing page has sign-up call to action", async ({ page }) => {
    await page.goto("/");
    // Check sign-up CTA is visible
    const signUpBtn = page.getByRole("link", { name: /get started|sign up|join/i }).first();
    await expect(signUpBtn).toBeVisible();
  });

  test("sign-up page loads and has required fields", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign up|create/i })).toBeVisible();
  });
});

test.describe("Sign in flow", () => {
  test("sign-in page loads correctly", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel(/email/i).fill("wrong@email.com");
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();
    // Expect an error message to appear
    await expect(page.getByRole("alert").or(page.getByText(/invalid|incorrect|error/i))).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Forgot password", () => {
  test("forgot password page is accessible from sign-in", async ({ page }) => {
    await page.goto("/sign-in");
    const forgotLink = page.getByRole("link", { name: /forgot/i });
    await expect(forgotLink).toBeVisible();
    await forgotLink.click();
    await expect(page).toHaveURL(/forgot/);
  });
});
