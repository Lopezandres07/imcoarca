import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ArticlePage, type ArticleData } from '../pages/ArticlePage';
import { DataHelper } from '../utils/DataHelper';

const ADMIN_EMAIL = 'tae@testing.com';
const ADMIN_PASSWORD = 'Tae@2026';

test.describe('Articles Module', () => {
  let loginPage: LoginPage;
  let articlePage: ArticlePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    articlePage = new ArticlePage(page);
    await loginPage.navigate();
    await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  test('Create and verify article persistence', async () => {
    const articleData: ArticleData = {
      name: DataHelper.generateArticleName(),
      sku: DataHelper.generateSKU(),
      salePrice: DataHelper.generatePrice(),
      stock: DataHelper.generateStock()
    };

    await test.step('Navigate to Articles module', async () => {
      await articlePage.navigate();
    });

    await test.step(`Create article: ${articleData.name}`, async () => {
      await articlePage.createArticle(articleData);
    });

    await test.step('Search and verify article persistence', async () => {
      await articlePage.navigate();
      await articlePage.searchArticle(articleData.name);
      const isVisible = await articlePage.isArticleVisible(articleData.name);
      expect(isVisible).toBeTruthy();
    });
  });
});