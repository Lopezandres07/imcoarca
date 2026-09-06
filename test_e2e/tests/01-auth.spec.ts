import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL as string;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD as string;
const SELLER_EMAIL = process.env.SELLER_EMAIL as string;
const SELLER_PASSWORD = process.env.SELLER_PASSWORD as string;

test.describe("Login validation", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test("Valid Login with Admin", async ({ page }) => {
    await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("Valid Login with Seller", async ({ page }) => {
    await loginPage.login(SELLER_EMAIL, SELLER_PASSWORD);
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("Invalid login with wrong password", async ({ page }) => {
    await loginPage.login(ADMIN_EMAIL, "wrongpassword");
    await expect(page).toHaveURL(/.*login/);
    await expect(loginPage.notificationMessage).toContainText(
      "Las credenciales proporcionadas son incorrectas.",
    );
  });
});
