import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '../utils/BasePage';

export interface ClientData {
  fullName: string;
  cuit: string;
  email: string;
}

export class ClientPage extends BasePage {
  readonly createClientButton: Locator;
  readonly cuitInput: Locator;
  readonly taxSelect: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly saveButton: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    super(page);
    this.createClientButton = page.locator('button:has-text("Crear Cliente")');
    this.cuitInput = page.locator('#cuit');
    this.taxSelect = page.locator('#tax');
    this.nameInput = page.locator('#name');
    this.emailInput = page.locator('#email');
    this.saveButton = page.locator('button[type="submit"]:has-text("Guardar")');
    this.successToast = page.locator('.Toastify').locator('div[role="alert"]');
  }

  async navigate(): Promise<void> {
    await this.navigateTo('/clientes');
  }

  async createClient(data: ClientData): Promise<ClientData> {
    await this.clickElement(this.createClientButton, 'Crear Cliente button');
    await this.waitForVisibility(this.cuitInput, 'Client form CUIT input');

    await this.fillInput(this.cuitInput, data.cuit, 'CUIT');
    await this.selectOption(this.taxSelect, 'I', 'Condición Tributaria (IVA Responsable Inscripto)');
    await this.fillInput(this.nameInput, data.fullName, 'Nombre o Razón Social');
    await this.fillInput(this.emailInput, data.email, 'Email');

    await this.clickElement(this.saveButton, 'Guardar client form');
    await this.waitForVisibility(this.successToast, 'Success notification');
    return data;
  }
  async searchClient(query: string): Promise<void> {
    await this.fillInput(this.page.locator('input[placeholder*="Buscar"], input[type="search"]').first(), query, 'Client search input');
    await this.clickElement(this.page.locator('button:has-text("Buscar")'), 'Buscar button');
    await this.page.waitForLoadState('networkidle');
  }

  async isClientVisible(name: string): Promise<boolean> {
    await this.page.waitForTimeout(1000);
    return this.page.locator('tbody').locator(`td:has-text("${name}")`).first().isVisible();
  }
}
