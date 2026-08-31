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

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    clientPage = new ClientPage(page);
    await loginPage.navigate();
    await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  test("Create and verify client persistence", async () => {
    const clientData: ClientData = {
      fullName: DataHelper.generateClientName(),
      cuit: DataHelper.generateCUIT(),
      email: DataHelper.generateEmail(),
    };

    await test.step("Navigate to Clients module", async () => {
      await clientPage.navigate();
    });

    await test.step(`Create client: ${clientData.fullName}`, async () => {
      await clientPage.createClient(clientData);
    });

    await test.step("Search and verify client persistence", async () => {
      await clientPage.navigate();
      await clientPage.searchClient(clientData.fullName);
      const isVisible = await clientPage.isClientVisible(clientData.fullName);
      expect(isVisible).toBeTruthy();
    });
  });
});
