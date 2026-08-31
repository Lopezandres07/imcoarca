import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '../utils/BasePage';

export interface PaymentPayload {
  invoiceId: string;
  amount: string;
  paymentMethod: string;
}

export class PaymentPage extends BasePage {
  readonly createPaymentButton: Locator;
  readonly invoiceSearchInput: Locator;
  readonly invoiceOption: Locator;
  readonly amountInput: Locator;
  readonly paymentMethodSelect: Locator;
  readonly savePaymentButton: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    super(page);
    this.createPaymentButton = page.locator('button:has-text("Nuevo Cobro"), button:has-text("Registrar Pago")').first();
    this.invoiceSearchInput = page.locator('input[placeholder*="Buscar factura"], input[name="invoice_search"]').first();
    this.invoiceOption = page.locator('ul[role="listbox"] li, .dropdown-menu li, .react-select__menu .react-select__option').first();
    this.amountInput = page.locator('input[name="amount"], input[placeholder*="Monto"]').first();
    this.paymentMethodSelect = page.locator('select[name="payment_method"], #payment_method').first();
    this.savePaymentButton = page.locator('button[type="submit"]:has-text("Guardar"), button:has-text("Confirmar Pago")').first();
    this.successToast = page.locator('.Toastify').locator('div[role="alert"]');
  }

  async navigate(): Promise<void> {
    await this.navigateTo('/cobranzas'); 
  }

  async processPayment(payload: PaymentPayload): Promise<void> {
    await this.clickElement(this.createPaymentButton, 'Registrar Pago button');
    
    await this.waitForVisibility(this.invoiceSearchInput, 'Invoice search input');
    await this.fillInput(this.invoiceSearchInput, payload.invoiceId, 'Invoice search');
    await this.page.waitForTimeout(1000); 
    
    try {
        await this.clickElement(this.invoiceOption.filter({ hasText: payload.invoiceId }).first(), `Select invoice: ${payload.invoiceId}`);
    } catch(e) {
    }

    await this.fillInput(this.amountInput, payload.amount, 'Amount');
    
    if (await this.paymentMethodSelect.isVisible()) {
        try {
             await this.selectOption(this.paymentMethodSelect, payload.paymentMethod, 'Payment Method');
        } catch(e) {
            await this.paymentMethodSelect.selectOption({ index: 1 });
        }
    }

    await this.clickElement(this.savePaymentButton, 'Confirmar Pago');
    await this.waitForVisibility(this.successToast, 'Success notification');
  }
}
