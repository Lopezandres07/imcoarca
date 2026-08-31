import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

const ADMIN_EMAIL = 'tae@testing.com';
const ADMIN_PASSWORD = 'Tae@2026';
const SELLER_EMAIL = 'vendedor@testing.com';
const SELLER_PASSWORD = 'Tae@2026';

test.describe('Auth Module', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('Valid Login with Admin', async ({ page }) => {
    await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('Valid Login with Seller', async ({ page }) => {
    await loginPage.login(SELLER_EMAIL, SELLER_PASSWORD);
    await expect(page).toHaveURL(/.*dashboard/);
  });
}); 