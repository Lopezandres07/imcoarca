import { test, expect } from "@playwright/test";
import * as allure from "allure-js-commons";
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

    await expect(loginPage.emailInput).toBeVisible();
  });

  test("Valid Login with Admin", async ({ page }) => {
    await allure.epic("Autenticación y Seguridad");
    await allure.feature("Inicio de Sesión");
    await allure.story("Login exitoso con rol Administrador");
    await allure.severity("blocker");

    await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);

    await expect(page).toHaveURL(/.*dashboard/);
    await expect(loginPage.pageDashboardTitle).toBeVisible();
  });

  test("Valid Login with Seller", async ({ page }) => {
    await allure.epic("Autenticación y Seguridad");
    await allure.feature("Inicio de Sesión");
    await allure.story("Login exitoso con rol Vendedor");
    await allure.severity("normal");

    await loginPage.login(SELLER_EMAIL, SELLER_PASSWORD);

    await expect(page).toHaveURL(/.*dashboard/);
    await expect(loginPage.pageDashboardTitle).toBeVisible();
  });

  test("Invalid login with wrong password", async ({ page }) => {
    await allure.epic("Autenticación y Seguridad");
    await allure.feature("Inicio de Sesión");
    await allure.story("Intento de login fallido con contraseña incorrecta");
    await allure.severity("normal");

    await loginPage.login(ADMIN_EMAIL, "wrongpassword");

    await expect(page).toHaveURL(/.*login/);
    await expect(loginPage.notificationMessage).toContainText(
      "Las credenciales proporcionadas son incorrectas.",
    );
  });
});
