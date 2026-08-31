import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ClientPage, type ClientData } from '../pages/ClientPage';
import { ArticlePage, type ArticleData } from '../pages/ArticlePage';
import { InvoicePage } from '../pages/InvoicePage';
import { DataHelper } from '../utils/DataHelper';

const ADMIN_EMAIL = 'tae@testing.com';
const ADMIN_PASSWORD = 'Tae@2026';

test.describe('Invoices Module', () => {
  let loginPage: LoginPage;
  let clientPage: ClientPage;
  let articlePage: ArticlePage;
  let invoicePage: InvoicePage;

  let clientData: ClientData;
  let articleData: ArticleData;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    loginPage = new LoginPage(page);
    clientPage = new ClientPage(page);
    articlePage = new ArticlePage(page);
    
    await loginPage.navigate();
    await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);

    clientData = {
      fullName: DataHelper.generateClientName(),
      cuit: DataHelper.generateCUIT(),
      email: DataHelper.generateEmail()
    };
    await clientPage.navigate();
    await clientPage.createClient(clientData);

    articleData = {
      name: DataHelper.generateArticleName(),
      sku: DataHelper.generateSKU(),
      salePrice: DataHelper.generatePrice(),
      stock: DataHelper.generateStock()
    };
    await articlePage.navigate();
    await articlePage.createArticle(articleData);

    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    invoicePage = new InvoicePage(page);
    await loginPage.navigate();
    await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  test('Create Invoice and verify generation', async () => {
    await test.step('Navigate to Invoices module', async () => {
      await invoicePage.navigate();
    });

    await test.step('Issue Invoice', async () => {
      const generatedInvoiceId = await invoicePage.createInvoice({
        clientName: clientData.fullName,
        articleName: articleData.name,
        quantity: '1'
      });
      expect(generatedInvoiceId).toBeTruthy();
    });
  });
});