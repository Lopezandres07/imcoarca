import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { ArticlePage, type ArticleData } from "../pages/ArticlePage";
import { DataHelper } from "../utils/DataHelper";
import dotenv from "dotenv";
dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL as string;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD as string;

test.describe("Articles Module", () => {
  let loginPage: LoginPage;
  let articlePage: ArticlePage;

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

  let sku = articleData.sku;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    articlePage = new ArticlePage(page);
    await loginPage.navigate();
    await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);

    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("Create,verify and delete article", async () => {
    await test.step("Navigate to Articles module", async () => {
      await articlePage.navigate();

      await expect(articlePage.page).toHaveURL(/.*articulos/);
    });

    await test.step("Open new article form", async () => {
      await articlePage.goToCreateForm();

      await expect(articlePage.page).toHaveURL(/.*nuevo/);
    });

    await test.step("Create article", async () => {
      await articlePage.createArticle(articleData);

      await expect(articlePage.page).toHaveURL(/.*articulos/);
      await expect(articlePage.getNotification("Artículo guardado con éxito!")).toBeVisible();
    });

    await test.step("Search and verify article persistence", async () => {
      await articlePage.searchArticle(sku);

      await expect(articlePage.spinner).toBeHidden()
      await expect(articlePage.getArticleRow(sku)).toHaveText(sku);
    });

    await test.step("Delete article and verify cleanup", async () => {
      await articlePage.deleteArticle();
      await expect(articlePage.getNotification("Artículo eliminado con éxito.")).toBeVisible();
    });
  });
});
