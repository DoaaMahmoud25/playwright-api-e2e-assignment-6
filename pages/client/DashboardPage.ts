import { Locator, Page, expect } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  private readonly cartButton: Locator;
  private readonly productCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartButton = page.locator("[routerLink*='cart']");
    this.productCards = page.locator(".card-body");
  }

  async open(): Promise<void> {
    await this.page.goto("/client");
  }

  private productCard(productName: string): Locator {
    return this.productCards.filter({ hasText: productName });
  }

  async addProductToCart(productName: string): Promise<void> {
    const card = this.productCard(productName);
    await card.getByRole("button", { name: /add to cart/i }).click();
  }

  async expectProductNotListed(productName: string): Promise<void> {
    
    await expect(this.productCards.first()).toBeVisible();
    await expect(
      this.productCard(productName),
      `Expected "${productName}" NOT to exist on the dashboard`
    ).toHaveCount(0);
  }

  async openCart(): Promise<void> {
    await this.cartButton.click();
  }
}