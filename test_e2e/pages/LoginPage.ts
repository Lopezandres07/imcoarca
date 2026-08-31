import { type Page, type Locator } from "@playwright/test";
import { BasePage } from "../utils/BasePage";

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator("#email");
    this.passwordInput = page.locator("#password");
    this.submitButton = page.locator('button[type="submit"]');
  }

  async navigate(): Promise<void> {
    await this.navigateTo("/login");
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillInput(this.emailInput, email, "Email field");
    await this.fillInput(this.passwordInput, password, "Password field");
    await this.clickElement(this.submitButton, "Login submit button");
  }
}
