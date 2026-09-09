import { type Page, type Locator } from "@playwright/test";
import { BasePage } from "../utils/BasePage";

export interface ClientData {
  fullName: string;
  cuit: string;
  email: string;
  phone: string;
  contact: string;
  field: string;
  zone: string;
  exportLaw: string;
}

export class ClientPage extends BasePage {
  readonly createClientButton: Locator;
  readonly cuitInput: Locator;
  readonly phone: Locator;
  readonly contact: Locator;
  readonly field: Locator;
  readonly zone: Locator;
  readonly exportLaw: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly saveButton: Locator;
  readonly notificationMessage: Locator;
  readonly spinner: Locator;
  readonly deleteButton: Locator

  constructor(page: Page) {
    super(page);
    this.createClientButton = page.locator('button:has-text("Crear Cliente")');
    this.cuitInput = page.locator("#cuit");
    this.phone = page.locator("#phone");
    this.contact = page.locator("#contact");
    this.field = page.locator("#rubro");
    this.zone = page.locator("#zone");
    this.exportLaw = page.locator("#ley_exportacion_tdf");
    this.nameInput = page.locator("#name");
    this.emailInput = page.locator("#email");
    this.saveButton = page.locator('button[type="submit"]:has-text("Guardar")');
    this.notificationMessage = page.getByRole("alert");
    this.spinner = page.locator('.animate-spin');
    this.deleteButton = page.getByRole('button', { name: 'Eliminar' });
  }

  async navigate(): Promise<void> {
    await this.navigateTo("/clientes");
  }

  async goToCreateForm(): Promise<void> {
    await this.clickElement(this.createClientButton, "Crear Cliente button");
  }

  async createClient(data: ClientData): Promise<ClientData> {
    await this.fillInput(this.nameInput, data.fullName, "Nombre o Razón Social");
    await this.fillInput(this.cuitInput, data.cuit, "CUIT");
    await this.fillInput(this.phone, data.phone, "Teléfono");
    await this.fillInput(this.emailInput, data.email, "Email");
    await this.fillInput(this.contact, data.contact, "Contacto");
    await this.fillInput(this.field, data.field, "Rubro");
    await this.selectOption(this.zone, data.zone, "Zona");
    await this.selectOption(this.exportLaw, data.exportLaw, "Ley Exportación TDF");
    await this.clickElement(this.saveButton, "Guardar client form");

    return data
  }

  async searchClient(query: string): Promise<void> {
    await this.fillInput(
      this.page.locator("#search-term"),
      query,
      "Client search input",
    );
    await this.clickElement(
      this.page.locator('button:has-text("Buscar")'),
      "Buscar button",
    );
  }

  getNotification(text: string): Locator {
    return this.notificationMessage.filter({ hasText: text });
  }

  getClientRow(email: string): Locator {
    return this.page.getByText(email).first();
  }

  async deleteClient(): Promise<void> {
    await this.clickElement(this.deleteButton, "Delete client button");
    await this.clickElement(this.page.getByRole('button', { name: 'Confirmar' }), "Confirmar delete button");
  }
}
