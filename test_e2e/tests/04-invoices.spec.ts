import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { ClientPage, type ClientData } from "../pages/ClientPage";
import { ArticlePage, type ArticleData } from "../pages/ArticlePage";
import { InvoicePage } from "../pages/InvoicePage";
import { DataHelper } from "../utils/DataHelper";
import dotenv from "dotenv";
dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL as string;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD as string;

test.describe("Invoices Module", () => {
  let invoicePage: InvoicePage;

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

  const articleData: ArticleData = {
    sku: DataHelper.generateSKU(),
    description: DataHelper.generateArticleName(),
    line: "37",
    stock: DataHelper.generateStock(),
    purchasePrice: DataHelper.generatePrice(),
    salePrice: DataHelper.generatePrice(),
    category: "53",
    status: "1",
  };

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const setupPage = await context.newPage();

    const loginPage = new LoginPage(setupPage);
    const clientPage = new ClientPage(setupPage);
    const articlePage = new ArticlePage(setupPage);

    // Login inicial
    await loginPage.navigate();
    await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    await expect(setupPage).toHaveURL(/.*dashboard/);

    // Crear Cliente Pre-requisito
    await clientPage.navigate();
    await clientPage.goToCreateForm();
    await clientPage.createClient(clientData);
    await expect(clientPage.getNotification("Cliente guardado con éxito!")).toBeVisible();

    // Crear Artículo Pre-requisito
    await articlePage.navigate();
    await expect(setupPage).toHaveURL(/.*articulos/); // Sin tilde en la URL
    await articlePage.goToCreateForm();
    await articlePage.createArticle(articleData);
    await expect(articlePage.getNotification("Artículo guardado con éxito!")).toBeVisible();

    // Cerramos el contexto temporal de setup
    await context.close();
  });

  // 3. Cada test inicia con su propio contexto de navegador fresco
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    invoicePage = new InvoicePage(page);

    await loginPage.navigate();
    await expect(loginPage.emailInput).toBeVisible();
    await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("Create Invoice and verify generation", async () => {
    await test.step("Navigate to Invoices module", async () => {
      await invoicePage.navigate();
    });

    await test.step("Issue Invoice", async () => {
      const generatedInvoiceId = await invoicePage.createInvoice({
        clientName: clientData.fullName,
        articleName: articleData.name,
        quantity: "1",
      });
      expect(generatedInvoiceId).toBeTruthy();
    });
  });
});
