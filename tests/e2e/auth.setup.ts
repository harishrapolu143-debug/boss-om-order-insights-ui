import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');

  // Login through your application's authentication flow

  await page.getByLabel('Email').fill(process.env.TEST_USERNAME!);

  await page.getByLabel('Password').fill(process.env.TEST_PASSWORD!);

  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/dashboard/);

  await page.context().storageState({
    path: authFile,
  });
});