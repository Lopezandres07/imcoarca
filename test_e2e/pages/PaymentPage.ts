import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '../utils/BasePage';

export interface PaymentPayload {
  clientCode: string;
  paymentMethod: string;
  account: string;
}

export class PaymentPage extends BasePage {
  readonly createPaymentButton: Locator;
  readonly clientCodeInput: Locator;
  readonly pendingBalanceButton: Locator;
  readonly addPaymentMethodButton: Locator;
  readonly paymentMethodSelect: Locator;
  readonly accountInput: Locator;
  readonly pendingAmountButton: Locator;
  readonly savePaymentButton: Locator;
  readonly totalPayment: Locator;
  readonly notificationMessage: Locator;
  readonly spinner: Locator;
  readonly deleteButton: Locator;
  readonly confirmDeleteButton: Locator;

  constructor(page: Page) {
    super(page);
    this.createPaymentButton = page.getByRole('button', { name: 'Crear Cobranza' });
    this.clientCodeInput = page.locator('div').filter({ hasText: /^Cliente/ }).locator('input').first();
    this.pendingBalanceButton = page.getByTitle('Llenar con saldo pendiente');
    this.addPaymentMethodButton = page.getByRole('button', { name: 'Añadir Medio' })
    this.paymentMethodSelect = page.locator('#payment_method_0');
    this.accountInput = page.locator('div').filter({ hasText: /^Cuenta/ }).locator('input').first();
    this.pendingAmountButton = page.getByLabel('Completar valor con el faltante respecto al total aplicado');
    this.savePaymentButton = page.getByRole('button', { name: 'Guardar Cobranza' })
    this.totalPayment = page.locator('span:has-text("TOTAL COBRADO:") + span')
    this.notificationMessage = page.locator('.Toastify__toast-body, .Toastify__toast');
    this.spinner = page.locator('.animate-spin');
    this.deleteButton = page.getByRole('button', { name: 'Eliminar' });
    this.confirmDeleteButton = page.getByRole('button', { name: 'Confirmar' });
  }

  async navigate(): Promise<void> {
    await this.navigateTo('/cobranzas');
  }

  async goToCreateForm(): Promise<void> {
    await this.clickElement(this.createPaymentButton, "Crear cobranza");
  }

  async processPayment(data: PaymentPayload, toastText: string): Promise<{ rawTotal: string, cleanTotal: string }> {
    const waitForToast = async () => {
      const toast = this.notificationMessage.filter({ hasText: new RegExp(toastText, 'i') }).first();

      await toast.waitFor({ state: 'visible' });

      await toast.click();

      await toast.waitFor({ state: 'hidden' });
    };

    await this.fillInput(this.clientCodeInput, data.clientCode, 'Client search');
    await this.clientCodeInput.press('Enter');
    await waitForToast();

    await this.clickElement(this.addPaymentMethodButton, "Add Payment Method button");
    await this.clickElement(this.pendingBalanceButton, 'Pending Balance button');
    await this.selectOption(this.paymentMethodSelect, data.paymentMethod, 'Payment Method');
    await this.fillInput(this.accountInput, data.account, 'Account input');
    await this.accountInput.press('Enter');

    await this.clickElement(this.pendingAmountButton, 'Pending Amount button');

    const rawTotal = (await this.totalPayment.innerText()).replace(/\s+/g, ' ').trim();
    const cleanTotal = rawTotal.split(',')[0].replace(/\D/g, '');

    await this.clickElement(this.savePaymentButton, 'Save Payment button');

    return { rawTotal, cleanTotal };
  }

  async searchPayment(query: string): Promise<void> {
    await this.fillInput(
      this.page.locator("#search-term"),
      query,
      "Payment search input"
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

  async deletePayment(): Promise<void> {
    await this.clickElement(this.deleteButton, "Delete payment button");
    await this.confirmDeleteButton.waitFor({ state: 'visible' });
    await this.clickElement(this.confirmDeleteButton, "Confirmar delete button");
  }
}
