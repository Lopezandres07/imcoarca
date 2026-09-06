import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { ClientPage, type ClientData } from "../pages/ClientPage";
import { DataHelper } from "../utils/DataHelper";
import dotenv from "dotenv";
dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL as string;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD as string;

test.describe("Clients Module", () => {
  let loginPage: LoginPage;
  let clientPage: ClientPage;

  const clientData: ClientData = {
    fullName: DataHelper.generateClientName(),
    cuit: DataHelper.generateCUIT(),
    email: DataHelper.generateEmail(),
    phone: DataHelper.generatePhone(),
    contact: DataHelper.generateContact(),
    field: "Alimentos",
    zone: "8",
    exportLaw: "1",
  };

  let email = clientData.email;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    clientPage = new ClientPage(page);
    await loginPage.navigate();
    await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);

    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("Create, verify and delete client", async () => {
    await test.step("Navigate to Clients module", async () => {
      await clientPage.navigate();

      await expect(clientPage.page).toHaveURL(/.*clientes/);
    });

    await test.step(`Open new client form`, async () => {
      await clientPage.goToCreateForm();

      await expect(clientPage.page).toHaveURL(/.*nuevo/);
    });

    await test.step(`Create client`, async () => {
      await clientPage.createClient(clientData);

      await expect(clientPage.getNotification("Cliente guardado con éxito!")).toBeVisible();
      await expect(clientPage.page).toHaveURL(/.*clientes/);
      await expect(clientPage.spinner).toBeHidden()
    });

    await test.step("Search and verify client persistence", async () => {
      await clientPage.searchClient(email);

      await expect(clientPage.spinner).toBeHidden()
      await expect(clientPage.getClientRow(email)).toHaveText(email);
    });

    await test.step("Delete client and verify cleanup", async () => {
      await clientPage.deleteClient();
      await expect(clientPage.getNotification("Cliente eliminado con éxito.")).toBeVisible();
    });
  });
});