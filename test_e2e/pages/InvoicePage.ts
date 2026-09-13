import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '../utils/BasePage';

export interface InvoicePayload {
  clientCode: string;
  vendedorCode: string;
  monedaCode: string;
  address: string
  articleCode: string;
}

export class InvoicePage extends BasePage {
  readonly createInvoiceButton: Locator;
  readonly clientCode: Locator;
  readonly vendedorCode: Locator;
  readonly monedaCode: Locator;
  readonly clientAddress: Locator;
  readonly addressInput: Locator;
  readonly addArticleButton: Locator;
  readonly articleCode: Locator;
  readonly totalInvoice: Locator;
  readonly saveInvoiceButton: Locator;
  readonly notificationMessage: Locator;
  readonly spinner: Locator;
  readonly deleteButton: Locator;
  readonly confirmDeleteButton: Locator

  constructor(page: Page) {
    super(page);
    this.createInvoiceButton = page.locator('button:has-text("Crear Factura de Venta")');
    this.clientCode = page.locator('div').filter({ hasText: /^Cliente/ }).locator('input').first();
    this.vendedorCode = page.locator('div').filter({ hasText: /^Vendedor/ }).locator('input').first();
    this.monedaCode = page.locator('div').filter({ hasText: /^Moneda/ }).locator('input').first();
    this.clientAddress = page.locator('[name="delivery_address_selector"]');
    this.addressInput = page.getByRole('textbox', { name: 'Ingrese la nueva dirección de entrega' })
    this.addArticleButton = page.getByRole('button', { name: 'Agregar Ítem' });
    this.articleCode = page.locator('div').filter({ hasText: /^Artículo/ }).locator('input').first();
    this.totalInvoice = page.locator('span:has-text("Total Final:") + span');
    this.saveInvoiceButton = page.getByRole('button', { name: 'Guardar Factura' });
    this.notificationMessage = page.locator('.Toastify__toast-body, .Toastify__toast');
    this.spinner = page.locator('.animate-spin');
    this.deleteButton = page.getByRole('button', { name: 'Eliminar' });
    this.confirmDeleteButton = page.getByRole('button', { name: 'Confirmar' });
  }

  async navigate(): Promise<void> {
    await this.navigateTo('/facturas-de-venta');
  }

  async goToCreateForm(): Promise<void> {
    await this.clickElement(this.createInvoiceButton, "Crear Factura de Venta");
  }

  async createInvoice(data: InvoicePayload, toastText: string): Promise<{ rawTotal: string, cleanTotal: string }> {
    const waitForToast = async () => {
      const toast = this.notificationMessage.filter({ hasText: new RegExp(toastText, 'i') }).first();

      await toast.waitFor({ state: 'visible' });

      await toast.click();

      await toast.waitFor({ state: 'hidden' });
    };

    await this.fillInput(this.clientCode, data.clientCode, 'Client input');
    await this.clientCode.press('Enter');
    await waitForToast();

    await this.fillInput(this.vendedorCode, data.vendedorCode, 'Vendedor input');
    await this.vendedorCode.press('Enter');
    await waitForToast();

    await this.fillInput(this.monedaCode, data.monedaCode, 'Moneda input');
    await this.monedaCode.press('Enter');
    await waitForToast();

    await this.selectOption(this.clientAddress, '--- Ingresar Otra Dirección ---', 'Client Address');
    await this.fillInput(this.addressInput, data.address, 'Address input');

    await this.clickElement(this.addArticleButton, 'Add Article');
    await this.fillInput(this.articleCode, data.articleCode, 'Article input');
    await this.articleCode.press('Enter');
    await waitForToast();

    const rawTotal = (await this.totalInvoice.innerText()).replace(/\s+/g, ' ').trim();
    const cleanTotal = rawTotal.split(',')[0].replace(/\D/g, '');

    await this.clickElement(this.saveInvoiceButton, 'Guardar Factura');

    return { rawTotal, cleanTotal };
  }

  async searchInvoice(query: string): Promise<void> {
    await this.fillInput(
      this.page.locator("#search-term"),
      query,
      "Invoice search input"
    );
    await this.clickElement(
      this.page.locator('button:has-text("Buscar")'),
      "Buscar button"
    );
  }

  getNotification(text: string): Locator {
    return this.notificationMessage.filter({ hasText: new RegExp(text, 'i') }).first();
  }

  getInvoiceRow(textToFind: string): Locator {
    return this.page.locator('tbody tr').filter({ hasText: textToFind }).first();
  }

  async deleteInvoice(): Promise<void> {
    await this.clickElement(this.deleteButton, "Delete invoice button");
    await this.confirmDeleteButton.waitFor({ state: 'visible' });
    await this.clickElement(this.confirmDeleteButton, "Confirmar delete button");
  }
}