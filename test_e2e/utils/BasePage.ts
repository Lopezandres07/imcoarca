import { type Page, type Locator, test } from "@playwright/test";

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async clickElement(locator: Locator, description: string): Promise<void> {
    await test.step(`Click: ${description}`, async () => {
      await locator.click();
    });
  }

  async fillInput(
    locator: Locator,
    value: string,
    description: string,
  ): Promise<void> {
    await test.step(`Fill "${value}" into: ${description}`, async () => {
      await locator.fill(value);
    });
  }

  async selectOption(
    locator: Locator,
    value: string,
    description: string,
  ): Promise<void> {
    await test.step(`Select "${value}" in: ${description}`, async () => {
      await locator.selectOption(value);
    });
  }

  async waitForVisibility(
    locator: Locator,
    description: string,
  ): Promise<void> {
    await test.step(`Wait for visibility: ${description}`, async () => {
      await locator.waitFor({ state: "visible" });
    });
  }

  async verifyText(
    locator: Locator,
    expectedText: string,
    description: string,
  ): Promise<void> {
    await test.step(`Verify text "${expectedText}" in: ${description}`, async () => {
      await locator
        .filter({ hasText: expectedText })
        .first()
        .waitFor({ state: "visible" });
    });
  }

  async navigateTo(path: string): Promise<void> {
    await test.step(`Navigate to: ${path}`, async () => {
      await this.page.goto(path);
      await this.page.waitForLoadState("networkidle");
    });
  }
}
