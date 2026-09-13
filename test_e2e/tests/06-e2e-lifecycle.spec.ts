import { test, expect } from "@playwright/test";
import * as allure from "allure-js-commons";
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
  test.setTimeout(180000);

  let loginPage: LoginPage;
  let clientPage: ClientPage;
  let articlePage: ArticlePage;
  let invoicePage: InvoicePage;
  let paymentPage: PaymentPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    clientPage = new ClientPage(page);
    articlePage = new ArticlePage(page);
    invoicePage = new InvoicePage(page);
    paymentPage = new PaymentPage(page);

    await loginPage.navigate();
    await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(loginPage.pageDashboardTitle).toBeVisible();
  });

  test("Full Transaction Lifecycle: Client -> Article -> Invoice -> Payment -> Cleanup", async () => {
    await allure.epic("Gestión Comercial y Operaciones");
    await allure.feature("Ciclo de Vida E2E Transaccional");
    await allure.story("Flujo completo 100% UI: Cliente -> Artículo -> Factura -> Cobranza -> Cleanup");
    await allure.severity("critical");
    await allure.owner("QA Automation Team");
    await allure.description(
      "Verifica de forma continua y sin atajos de API la persistencia y consistencia relacional " +
      "a través de la interfaz: Creación de Cliente, creación de Artículo, emisión de Factura de Venta, " +
      "cancelación mediante Cobranza con aplicación de saldo pendiente y eliminación completa en orden inverso."
    );

    const costPrice = DataHelper.generateCost();
    const salePrice = DataHelper.generatePrice(costPrice);

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
      purchasePrice: Number(costPrice),
      salePrice: Number(salePrice),
      category: "53",
      status: "1",
    };

    let clientCode = "";
    let invoiceTotal: { rawTotal: string; cleanTotal: string };
    let paymentTotal: { rawTotal: string; cleanTotal: string };

    // ==========================================
    // 1. CLIENT CREATION & PERSISTENCE
    // ==========================================
    await test.step("Navigate to Clients module", async () => {
      await clientPage.navigate();
      await expect(clientPage.page).toHaveURL(/.*clientes/);
    });

    await test.step("Open new client form", async () => {
      await clientPage.goToCreateForm();
      await expect(clientPage.page).toHaveURL(/.*nuevo/);
    });

    await test.step(`Create dynamic client: ${clientData.fullName}`, async () => {
      await clientPage.createClient(clientData);
      await expect(clientPage.getNotification("Cliente guardado con éxito!")).toBeVisible();
      await expect(clientPage.page).toHaveURL(/.*clientes/);
      await expect(clientPage.spinner).toBeHidden();
    });

    await test.step("Search client and retrieve generated client code", async () => {
      await clientPage.searchClient(clientData.email);
      await expect(clientPage.spinner).toBeHidden();
      await expect(clientPage.getClientRow(clientData.email)).toHaveText(clientData.email);

      clientCode = await clientPage.getClientCode(clientData.email);
      expect(clientCode).toBeTruthy();
    });

    await test.step("Navigate to Articles module", async () => {
      await articlePage.navigate();
      await expect(articlePage.page).toHaveURL(/.*articulos/);
      await expect(articlePage.pageTitle).toBeVisible();
    });

    await test.step("Open new article form", async () => {
      await articlePage.goToCreateForm();
      await expect(articlePage.page).toHaveURL(/.*nuevo/);
      await expect(articlePage.pageNewArticleTitle).toBeVisible();
    });

    await test.step(`Create dynamic article: ${articleData.description}`, async () => {
      await articlePage.createArticle(articleData);
      await expect(articlePage.page).toHaveURL(/.*articulos/);
      await expect(articlePage.getNotification("Artículo guardado con éxito!")).toBeVisible();
    });

    await test.step("Search and verify article persistence", async () => {
      await articlePage.searchArticle(articleData.sku);
      await expect(articlePage.spinner).toBeHidden();
      await expect(articlePage.getArticleRow(articleData.sku)).toHaveText(articleData.sku);
    });

    await test.step("Navigate to Invoices module", async () => {
      await invoicePage.navigate();
      await expect(invoicePage.page).toHaveURL(/.*facturas-de-venta/);
    });

    await test.step("Open new invoice form", async () => {
      await invoicePage.goToCreateForm();
      await expect(invoicePage.page).toHaveURL(/.*nuevo/);
      await expect(invoicePage.clientCode).toBeVisible();
    });

    await test.step("Issue Invoice linking created Client and Article", async () => {
      invoiceTotal = await invoicePage.createInvoice(
        {
          clientCode: clientCode,
          vendedorCode: "01",
          monedaCode: "01",
          articleCode: articleData.sku,
          address: "Calle Falsa 123",
        },
        "seleccionado"
      );

      await expect(invoicePage.getNotification("creada con")).toBeVisible();
      await expect(invoicePage.spinner).toBeHidden();
    });

    await test.step("Search and verify generated invoice persistence", async () => {
      await invoicePage.searchInvoice(invoiceTotal.cleanTotal);
      await expect(invoicePage.getInvoiceRow(invoiceTotal.rawTotal)).toBeVisible();
      await expect(invoicePage.getInvoiceRow(clientData.fullName)).toBeVisible();
    });

    await test.step("Navigate to Payment module", async () => {
      await paymentPage.navigate();
      await expect(paymentPage.page).toHaveURL(/.*cobranzas/);
    });

    await test.step("Open new payment form", async () => {
      await paymentPage.goToCreateForm();
      await expect(paymentPage.page).toHaveURL(/.*nuevo/);
      await expect(paymentPage.clientCodeInput).toBeVisible();
    });

    await test.step("Process Payment for the issued invoice", async () => {
      paymentTotal = await paymentPage.processPayment(
        {
          clientCode: clientCode,
          paymentMethod: "Efectivo",
          account: "100100",
        },
        "encontrado"
      );

      await expect(paymentPage.getNotification("éxito")).toBeVisible();
      await expect(paymentPage.spinner).toBeHidden();
    });

    await test.step("Search and verify generated payment persistence", async () => {
      await paymentPage.searchPayment(paymentTotal.cleanTotal);
      await expect(paymentPage.getInvoiceRow(paymentTotal.rawTotal)).toBeVisible();
      await expect(paymentPage.getInvoiceRow(clientData.fullName)).toBeVisible();
    });

    await test.step("Delete payment and verify cleanup", async () => {
      await paymentPage.deletePayment(clientData.fullName);
      await expect(paymentPage.getNotification("eliminad")).toBeVisible();
    });

    await test.step("Delete invoice and verify cleanup", async () => {
      await invoicePage.navigate();
      await expect(invoicePage.spinner).toBeHidden();
      await invoicePage.searchInvoice(clientData.fullName);
      await expect(invoicePage.spinner).toBeHidden();
      await expect(invoicePage.getInvoiceRow(clientData.fullName)).toBeVisible({ timeout: 10000 });
      await invoicePage.deleteInvoice(clientData.fullName);
      await expect(invoicePage.getNotification("Factura de Venta eliminado con éxito.")).toBeVisible();
    });

    await test.step("Delete article and verify cleanup", async () => {
      await articlePage.navigate();
      await expect(articlePage.spinner).toBeHidden();
      await articlePage.searchArticle(articleData.sku);
      await expect(articlePage.spinner).toBeHidden();
      await expect(articlePage.getArticleRow(articleData.sku)).toBeVisible({ timeout: 10000 });
      await articlePage.deleteArticle(articleData.sku);
      await expect(articlePage.getNotification("Artículo eliminado con éxito.")).toBeVisible();
    });

    await test.step("Delete client and verify cleanup", async () => {
      await clientPage.navigate();
      await expect(clientPage.spinner).toBeHidden();
      await clientPage.searchClient(clientData.email);
      await expect(clientPage.spinner).toBeHidden();
      await expect(clientPage.getClientRow(clientData.email)).toBeVisible({ timeout: 10000 });
      await clientPage.deleteClient(clientData.email);
      await expect(clientPage.getNotification("Cliente eliminado con éxito.")).toBeVisible();
    });
  });
});
