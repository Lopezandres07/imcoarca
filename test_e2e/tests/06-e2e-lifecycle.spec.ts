import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { ArticlePage, type ArticleData } from "../pages/ArticlePage";
import { ClientPage, type ClientData } from "../pages/ClientPage";
import { InvoicePage } from "../pages/InvoicePage";
import { PaymentPage } from "../pages/PaymentPage";
import { DataHelper } from "../utils/DataHelper";
import dotenv from "dotenv";
dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL as string;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD as string;

test.describe("E2E Lifecycle — Data Persistence & Transactional Flow", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  test("Full Transaction Lifecycle: Client -> Article -> Invoice -> Payment", async ({
    page,
  }) => {
    const clientPage = new ClientPage(page);
    const articlePage = new ArticlePage(page);
    const invoicePage = new InvoicePage(page);
    const paymentPage = new PaymentPage(page);

    const clientData: ClientData = {
      fullName: DataHelper.generateClientName(),
      cuit: DataHelper.generateCUIT(),
      email: DataHelper.generateEmail(),
    };

    const articleData: ArticleData = {
      name: DataHelper.generateArticleName(),
      sku: DataHelper.generateSKU(),
      salePrice: DataHelper.generatePrice(),
      stock: DataHelper.generateStock(),
    };

    let generatedInvoiceId = "";

    await test.step(`[Step 1] Create dynamic Client: ${clientData.fullName}`, async () => {
      await clientPage.navigate();
      await clientPage.createClient(clientData);
    });

    await test.step(`[Step 2] Create dynamic Article: ${articleData.name}`, async () => {
      await articlePage.navigate();
      await articlePage.createArticle(articleData);
    });

    await test.step(`[Step 3] Issue Invoice linking Client and Article`, async () => {
      await invoicePage.navigate();
      generatedInvoiceId = await invoicePage.createInvoice({
        clientName: clientData.fullName,
        articleName: articleData.name,
        quantity: "1",
      });

      expect(generatedInvoiceId).toBeTruthy();
    });

    await test.step(`[Step 4] Process Payment for Invoice ID: ${generatedInvoiceId}`, async () => {
      await paymentPage.navigate();
      await paymentPage.processPayment({
        invoiceId: generatedInvoiceId,
        amount: articleData.salePrice,
        paymentMethod: "Efectivo",
      });
    });
  });
});
