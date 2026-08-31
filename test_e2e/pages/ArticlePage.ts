import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '../utils/BasePage';

export interface ArticleData {
  name: string;
  sku: string;
  salePrice: string;
  stock: string;
}

export class ArticlePage extends BasePage {
  readonly createArticleButton: Locator;
  readonly skuInput: Locator;
  readonly nameInput: Locator;
  readonly lineSelect: Locator;
  readonly categorySelect: Locator;
  readonly statusSelect: Locator;
  readonly salePriceInput: Locator;
  readonly stockQuantityInput: Locator;
  readonly saveButton: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    super(page);
    this.createArticleButton = page.locator('button:has-text("Crear Artículo")');
    this.skuInput = page.locator('#sku');
    this.nameInput = page.locator('#name');
    this.lineSelect = page.locator('#line');
    this.categorySelect = page.locator('#category');
    this.statusSelect = page.locator('#is_active');
    this.salePriceInput = page.locator('#sale_price');
    this.stockQuantityInput = page.locator('#stock_quantity');
    this.saveButton = page.locator('button[type="submit"]:has-text("Guardar")');
    this.successToast = page.locator('.Toastify').locator('div[role="alert"]');
  }

  async navigate(): Promise<void> {
    await this.navigateTo('/articulos');
  }

  async createArticle(data: ArticleData): Promise<ArticleData> {
    await this.clickElement(this.createArticleButton, 'Crear Artículo button');
    await this.waitForVisibility(this.skuInput, 'Article form SKU input');

    await this.fillInput(this.skuInput, data.sku, 'SKU');
    await this.fillInput(this.nameInput, data.name, 'Nombre / Descripción Breve');
    await this.selectOption(this.lineSelect, '37', 'Línea (LINEA 1)');
    await this.selectOption(this.categorySelect, '53', 'Categoría (CATEGORIA 1)');
    await this.selectOption(this.statusSelect, '1', 'Estado (Activo)');
    await this.fillInput(this.salePriceInput, data.salePrice, 'Precio de Venta');
    await this.fillInput(this.stockQuantityInput, data.stock, 'Stock Actual');

    await this.clickElement(this.saveButton, 'Guardar article form');
    await this.waitForVisibility(this.successToast, 'Success notification');
    return data;
  }
  async searchArticle(query: string): Promise<void> {
    await this.fillInput(this.page.locator('input[placeholder*="Buscar"], input[type="search"]').first(), query, 'Article search input');
    await this.clickElement(this.page.locator('button:has-text("Buscar")'), 'Buscar button');
    await this.page.waitForLoadState('networkidle');
  }

  async isArticleVisible(name: string): Promise<boolean> {
    await this.page.waitForTimeout(1000);
    return this.page.locator('tbody').locator(`td:has-text("${name}")`).first().isVisible();
  }
}
