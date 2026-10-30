import { Locator, Page, expect } from "@playwright/test";

export class CartPage {
  readonly page: Page;
  private readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutButton = page.getByRole("button", { name: "Checkout" });
  }

  productRow(productName: string): Locator {
    return this.page
      .locator("div.cartSection h3")
      .filter({ hasText: productName });
  }

  async expectProductVisibility(productName: string): Promise<void> {
    await expect(
      this.productRow(productName).first(),
      `Expected "${productName}" to be visible in the cart`
    ).toBeVisible();
  }

  async expectProductNotInCart(productName: string): Promise<void> {
    await expect(
      this.productRow(productName),
      `Expected "${productName}" NOT to be in the cart`
    ).toHaveCount(0);
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}