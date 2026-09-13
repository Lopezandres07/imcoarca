import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { InvoicePage } from "../pages/InvoicePage";
import { DataHelper } from "../utils/DataHelper";
import { getAuthToken } from "../utils/ApiHelper";
import dotenv from "dotenv";
dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL as string;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD as string;
const API_URL = process.env.API_URL as string;

test.describe("Invoices Module", () => {
  test.setTimeout(90000);

  let loginPage: LoginPage;
  let invoicePage: InvoicePage;
  let authToken: string;
  let testClientCode: string;
  let testClientId: number;
  let testClientName: string
  let testArticleCode: string;
  let testArticleId: number;
  let invoiceTotal: { rawTotal: string, cleanTotal: string };

  const costPrice = DataHelper.generateCost();
  const salePrice = DataHelper.generatePrice(costPrice);

  test.beforeAll(async ({ request }) => {
    authToken = await getAuthToken(request);

    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };

    const clientRes = await request.post(`${API_URL}/clients`, {
      headers,
      data: {
        name: DataHelper.generateClientName(),
        cuit: DataHelper.generateCUIT(),
        email: DataHelper.generateEmail(),
        phone: DataHelper.generatePhone(),
        whatsapp: "",
        estado: "Activo",
        startdate: new Date().toISOString().split("T")[0],
        taxes: [],
      },
    });
    expect(clientRes.ok()).toBeTruthy();
    const clientData = await clientRes.json();
    console.log("CLIENT DATA", clientData);

    testClientCode = String(clientData.data.customer_code);
    testClientName = clientData.data.name;
    testClientId = clientData.data.id;

    const productRes = await request.post(`${API_URL}/products`, {
      headers,
      data: {
        sku: DataHelper.generateSKU(),
        name: DataHelper.generateArticleName(),
        stock_quantity: Number(DataHelper.generateStock()),
        cost_price: Number(costPrice),
        sale_price: Number(salePrice),
        unit: "",
        is_active: true,
        line: "37",
        category: "53",
        taxes: [],
      },
    });
    expect(productRes.ok()).toBeTruthy();
    const productData = await productRes.json();
    console.log("PRODUCT DATA", productData);

    testArticleCode = String(productData.data.sku);
    testArticleId = productData.data.id;
  });

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    invoicePage = new InvoicePage(page);

    await loginPage.navigate();
    await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("Create, Search and Delete Invoice", async () => {
    await test.step("Navigate to invoice module", async () => {
      await invoicePage.navigate();

      await expect(invoicePage.page).toHaveURL(/.*facturas-de-venta/);
    });

    await test.step("Open new invoice form", async () => {
      await invoicePage.goToCreateForm();

      await expect(invoicePage.page).toHaveURL(/.*nuevo/);
      await expect(invoicePage.clientCode).toBeVisible()
    });

    await test.step("Issue new Invoice", async () => {
      invoiceTotal = await invoicePage.createInvoice({
        clientCode: testClientCode,
        vendedorCode: "01",
        monedaCode: "01",
        articleCode: testArticleCode,
        address: "Calle Falsa 123"
      }, "seleccionado");

      await expect(invoicePage.getNotification("creada con")).toBeVisible();
      await expect(invoicePage.spinner).toBeHidden()
    });

    await test.step("Search the generated invoice", async () => {
      await invoicePage.searchInvoice(invoiceTotal.cleanTotal);

      await expect(invoicePage.getInvoiceRow(invoiceTotal.rawTotal)).toBeVisible();
      await expect(invoicePage.getInvoiceRow(testClientName)).toBeVisible();
    });

    await test.step("Delete the invoice", async () => {
      await invoicePage.deleteInvoice();

      await expect(invoicePage.getNotification("Factura de Venta eliminado con éxito.")).toBeVisible();
    });
  });

  test.afterAll(async ({ request }) => {
    const headers = {
      Authorization: `Bearer ${authToken}`,
      Accept: "application/json",
    };

    if (testClientId) {
      const clientRes = await request.delete(`${API_URL}/clients/${testClientId}`, { headers });
      if (!clientRes.ok()) {
        console.error(`❌ Error al eliminar cliente (${testClientId}): Status ${clientRes.status()}`);
      }
    }

    if (testArticleId) {
      const productRes = await request.delete(`${API_URL}/products/${testArticleId}`, { headers });
      if (!productRes.ok()) {
        console.error(`❌ Error al eliminar producto (${testArticleId}): Status ${productRes.status()}`);
      }
    }
  });
});