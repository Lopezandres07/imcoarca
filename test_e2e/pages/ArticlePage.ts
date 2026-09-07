import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '../utils/BasePage';

export interface ArticleData {
  sku: string;
  description: string;
  line: string;
  stock: string;
  purchasePrice: string;
  salePrice: string;
  category: string;
  status: string;
}

export class ArticlePage extends BasePage {
  readonly createArticleButton: Locator;
  readonly skuInput: Locator;
  readonly descriptionInput: Locator;
  readonly lineSelect: Locator;
  readonly stockInput: Locator;
  readonly purchasePriceInput: Locator;
  readonly salePriceInput: Locator;
  readonly categorySelect: Locator;
  readonly statusSelect: Locator;
  readonly saveButton: Locator;
  readonly notificationMessage: Locator;
  readonly spinner: Locator;
  readonly deleteButton: Locator;

  constructor(page: Page) {
    super(page);
    this.createArticleButton = page.locator('button:has-text("Crear Artículo")');
    this.skuInput = page.locator('#sku');
    this.descriptionInput = page.locator('#name');
    this.lineSelect = page.locator('#line');
    this.purchasePriceInput = page.locator('#purchase_price');
    this.salePriceInput = page.locator('#sale_price');
    this.stockInput = page.locator('#stock_quantity');
    this.categorySelect = page.locator('#category');
    this.statusSelect = page.locator('#is_active');
    this.saveButton = page.locator('button[type="submit"]:has-text("Guardar")');
    this.notificationMessage = page.getByRole("alert");
    this.spinner = page.locator('.animate-spin');
    this.deleteButton = page.getByRole('button', { name: 'Eliminar' });
  }

  async navigate(): Promise<void> {
    await this.navigateTo('/articulos');
  }

  async goToCreateForm(): Promise<void> {
    await this.clickElement(this.createArticleButton, "Crear Artículo button");
  }

  async createArticle(data: ArticleData): Promise<void> {
    await this.fillInput(this.skuInput, data.sku, 'SKU');
    await this.fillInput(this.descriptionInput, data.description, 'Descripción');
    await this.selectOption(this.lineSelect, data.line, 'Línea');
    await this.selectOption(this.categorySelect, data.category, 'Categoría');
    await this.selectOption(this.statusSelect, data.status, 'Estado');
    await this.fillInput(this.salePriceInput, data.salePrice, 'Precio de Venta');
    await this.fillInput(this.purchasePriceInput, data.purchasePrice, 'Precio de Compra');
    await this.fillInput(this.stockInput, data.stock, 'Stock');
    await this.clickElement(this.saveButton, 'Guardar article form');
  }

  getNotification(text: string): Locator {
    return this.notificationMessage.filter({ hasText: text });
  }

  getArticleRow(sku: string): Locator {
    return this.page.getByText(sku).first();
  }

  async searchArticle(query: string): Promise<void> {
    await this.fillInput(
      this.page.locator("#search-term"),
      query,
      "Article search input",
    );
    await this.clickElement(
      this.page.locator('button:has-text("Buscar")'),
      "Buscar button",
    );
  }

  async deleteArticle(): Promise<void> {
    await this.clickElement(this.deleteButton, "Delete article button");
    await this.clickElement(this.page.getByRole('button', { name: 'Confirmar' }), "Confirmar delete button");
  }
}
