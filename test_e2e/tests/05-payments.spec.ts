import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { PaymentPage } from "../pages/PaymentPage";
import { DataHelper } from "../utils/DataHelper";
import { getAuthToken } from "../utils/ApiHelper";
import dotenv from "dotenv";
dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL as string;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD as string;
const API_URL = process.env.API_URL as string;

test.describe("Payments Module", () => {
  test.setTimeout(1200000);

  let loginPage: LoginPage;
  let paymentPage: PaymentPage;
  let authToken: string;
  let testClientId: number;
  let testClientCode: string;
  let testClientName: string;
  let testArticleId: number;
  let testArticleCode: string;
  let testArticleName: string;
  let testInvoiceId: number;
  let paymentTotal = { rawTotal: "", cleanTotal: "" };

  const costPrice = DataHelper.generateCost();
  const salePrice = DataHelper.generatePrice(costPrice);

  test.beforeAll(async ({ playwright }) => {
    const request = await playwright.request.newContext();

    try {
      authToken = await getAuthToken(request);

      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      };

      // CLIENT
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

      testClientCode = String(clientData.data.customer_code);
      testClientName = clientData.data.name;
      testClientId = clientData.data.id;

      // PRODUCT
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

      testArticleCode = String(productData.data.sku);
      testArticleName = productData.data.name;
      testArticleId = productData.data.id;

      // INVOICE
      const today = new Date().toISOString().split("T")[0];

      const invoiceRes = await request.post(`${API_URL}/sales-invoices`, {
        headers,
        data: {
          id: 0,
          invoice_number: "",
          status: "1",
          series: "A",
          invoice_date: today,
          delivery_date: null,
          total_amount: Number(salePrice),
          notes: null,
          delivery_address: "Calle Falsa 123",
          discount_amount: 0,
          exchange_rate: 1530,
          client_id: testClientId,
          salesperson_id: 26,
          buyer_id: null,
          currency_id: 1,
          transport_id: null,
          sales_order_id: null,
          items: [
            {
              id: 0,
              line_number: 1,
              product_id: testArticleId,
              product_code: testArticleCode,
              product_name: testArticleName,
              quantity: 1,
              pending_quantity: 0,
              unit_price: Number(salePrice),
              cost_price: Number(costPrice),
              discount_amount: 0,
              commission_percentage: 0,
              taxes: [],
              base_sales_price: Number(salePrice),
              base_cost_price: Number(costPrice),
              stock_quantity: 309,
            },
          ],
          taxes: [],
          has_item_level_taxes: false,
          show_currency_equivalence: false,
        },
      });

      expect(invoiceRes.ok()).toBeTruthy();

      const invoiceData = await invoiceRes.json();

      testInvoiceId = invoiceData.data.id;
    } finally {
      await request.dispose();
    }
  });

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    paymentPage = new PaymentPage(page);

    await loginPage.navigate();
    await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("Create, Search and Delete Payment", async () => {
    await test.step("Navigate to payment module", async () => {
      await paymentPage.navigate();

      await expect(paymentPage.page).toHaveURL(/.*cobranzas/);
    });

    await test.step("Open new payment form", async () => {
      await paymentPage.goToCreateForm();

      await expect(paymentPage.page).toHaveURL(/.*nuevo/);
      await expect(paymentPage.clientCodeInput).toBeVisible();
    });

    await test.step("Process Payment", async () => {
      paymentTotal = await paymentPage.processPayment({
        clientCode: testClientCode,
        paymentMethod: "Efectivo",
        account: "100100",
      }, "encontrado");

      await expect(paymentPage.getNotification("éxito")).toBeVisible();
      await expect(paymentPage.spinner).toBeHidden();
    });

    await test.step("Search the generated payment", async () => {
      await paymentPage.searchPayment(paymentTotal.cleanTotal);

      await expect(paymentPage.getInvoiceRow(paymentTotal.rawTotal)).toBeVisible();
      await expect(paymentPage.getInvoiceRow(testClientName)).toBeVisible();
    });

    await test.step("Delete the payment", async () => {
      await paymentPage.deletePayment();

      await expect(paymentPage.getNotification("eliminad")).toBeVisible();
    });
  });

  test.afterAll(async ({ playwright }) => {
    const request = await playwright.request.newContext();

    try {
      const headers = {
        Authorization: `Bearer ${authToken}`,
        Accept: "application/json",
      };

      if (testInvoiceId) {
        const invoiceRes = await request.delete(
          `${API_URL}/sales-invoices/${testInvoiceId}`,
          { headers }
        );

        if (!invoiceRes.ok()) {
          console.error(
            `❌ Error al eliminar factura (${testInvoiceId}): Status ${invoiceRes.status()}`
          );
        }
      }

      if (testClientId) {
        const clientRes = await request.delete(
          `${API_URL}/clients/${testClientId}`,
          { headers }
        );

        if (!clientRes.ok()) {
          console.error(
            `❌ Error al eliminar cliente (${testClientId}): Status ${clientRes.status()}`
          );
        }
      }

      if (testArticleId) {
        const productRes = await request.delete(
          `${API_URL}/products/${testArticleId}`,
          { headers }
        );

        if (!productRes.ok()) {
          console.error(
            `❌ Error al eliminar producto (${testArticleId}): Status ${productRes.status()}`
          );
        }
      }
    } finally {
      await request.dispose();
    }
  });
});