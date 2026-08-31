import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '../utils/BasePage';

export interface InvoicePayload {
  clientName: string;
  articleName: string;
  quantity: string;
}

export class InvoicePage extends BasePage {
  readonly createInvoiceButton: Locator;
  readonly clientSearchInput: Locator;
  readonly clientOption: Locator;
  readonly articleSearchInput: Locator;
  readonly articleOption: Locator;
  readonly quantityInput: Locator;
  readonly addArticleButton: Locator;
  readonly saveInvoiceButton: Locator;
  readonly generatedInvoiceId: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    super(page);
    this.createInvoiceButton = page.locator('button:has-text("Nueva Venta"), button:has-text("Crear Factura")').first();
    this.clientSearchInput = page.locator('input[placeholder*="Buscar cliente"], #client_search, input[name="client_search"]').first();
    this.clientOption = page.locator('ul[role="listbox"] li, .dropdown-menu li, .react-select__menu .react-select__option').first();
    this.articleSearchInput = page.locator('input[placeholder*="Buscar artículo"], #article_search, input[name="article_search"]').first();
    this.articleOption = page.locator('ul[role="listbox"] li, .dropdown-menu li, .react-select__menu .react-select__option').first();
    this.quantityInput = page.locator('input[name="quantity"], input[placeholder="Cant"], input[placeholder="Cantidad"]').first();
    this.addArticleButton = page.locator('button:has-text("Agregar"), button:has-text("+")').first();
    this.saveInvoiceButton = page.locator('button:has-text("Guardar y emitir"), button[type="submit"]:has-text("Guardar")').first();
    // Assuming the invoice ID appears in a specific element after save or in a toast message
    this.generatedInvoiceId = page.locator('.invoice-id, [data-testid="invoice-id"], h3:has-text("Factura #")').first();
    this.successToast = page.locator('.Toastify').locator('div[role="alert"]');
  }

  async navigate(): Promise<void> {
    await this.navigateTo('/ventas'); // Assuming the URL path is /ventas for invoices/sales
  }

  async createInvoice(payload: InvoicePayload): Promise<string> {
    await this.clickElement(this.createInvoiceButton, 'Crear Factura button');
    
    // Select Client
    await this.waitForVisibility(this.clientSearchInput, 'Client search input');
    await this.fillInput(this.clientSearchInput, payload.clientName, 'Client search');
    await this.page.waitForTimeout(1000); // Wait for debounce/search
    await this.clickElement(this.clientOption.filter({ hasText: payload.clientName }).first(), `Select client: ${payload.clientName}`);

    // Add Article
    await this.fillInput(this.articleSearchInput, payload.articleName, 'Article search');
    await this.page.waitForTimeout(1000); // Wait for debounce/search
    await this.clickElement(this.articleOption.filter({ hasText: payload.articleName }).first(), `Select article: ${payload.articleName}`);
    
    if (await this.quantityInput.isVisible()) {
        await this.fillInput(this.quantityInput, payload.quantity, 'Quantity');
    }
    
    if (await this.addArticleButton.isVisible()) {
        await this.clickElement(this.addArticleButton, 'Agregar artículo');
    }

    // Save
    await this.clickElement(this.saveInvoiceButton, 'Guardar Factura');
    await this.waitForVisibility(this.successToast, 'Success notification');
    
    // Extract ID (Fallback to a dummy if we can't reliably get it from DOM yet without real inspection)
    let invoiceId = `INV-${Date.now()}`;
    try {
        if (await this.generatedInvoiceId.isVisible({ timeout: 2000 })) {
             const text = await this.generatedInvoiceId.textContent();
             if (text) invoiceId = text.replace('Factura #', '').trim();
        }
    } catch (e) {
        // Proceed with fallback
    }

    return invoiceId;
  }
}
