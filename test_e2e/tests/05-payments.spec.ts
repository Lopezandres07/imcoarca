import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ClientPage, type ClientData } from '../pages/ClientPage';
import { ArticlePage, type ArticleData } from '../pages/ArticlePage';
import { InvoicePage } from '../pages/InvoicePage';
import { PaymentPage } from '../pages/PaymentPage';
import { DataHelper } from '../utils/DataHelper';

const ADMIN_EMAIL = 'tae@testing.com';
const ADMIN_PASSWORD = 'Tae@2026';

test.describe('Payments Module', () => {
  let loginPage: LoginPage;
  let clientPage: ClientPage;
  let articlePage: ArticlePage;
  let invoicePage: InvoicePage;
  let paymentPage: PaymentPage;

  let generatedInvoiceId: string;
  let invoiceAmount: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    loginPage = new LoginPage(page);
    clientPage = new ClientPage(page);
    articlePage = new ArticlePage(page);
    invoicePage = new InvoicePage(page);
    
    await loginPage.navigate();
    await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);

    const clientData = {
      fullName: DataHelper.generateClientName(),
      cuit: DataHelper.generateCUIT(),
      email: DataHelper.generateEmail()
    };
    await clientPage.navigate();
    await clientPage.createClient(clientData);

    const articleData = {
      name: DataHelper.generateArticleName(),
      sku: DataHelper.generateSKU(),
      salePrice: DataHelper.generatePrice(),
      stock: DataHelper.generateStock()
    };
    await articlePage.navigate();
    await articlePage.createArticle(articleData);

    invoiceAmount = articleData.salePrice;

    await invoicePage.navigate();
    generatedInvoiceId = await invoicePage.createInvoice({
      clientName: clientData.fullName,
      articleName: articleData.name,
      quantity: '1'
    });

    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    paymentPage = new PaymentPage(page);
    await loginPage.navigate();
    await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  test('Process Payment for an Invoice', async () => {
    await test.step('Navigate to Payments module', async () => {
      await paymentPage.navigate();
    });

    await test.step('Process Payment', async () => {
      await paymentPage.processPayment({
        invoiceId: generatedInvoiceId,
        amount: invoiceAmount,
        paymentMethod: 'Efectivo'
      });
    });
  });
});