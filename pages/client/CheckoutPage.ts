import { Page, Locator, expect } from "@playwright/test";

export class CheckoutPage {
  readonly page: Page;
  private readonly cardForm: Locator;
  readonly creditCardNumberInput: Locator;
  readonly expiryMonthSelect: Locator;
  readonly expiryYearSelect: Locator;
  readonly cvvInput: Locator;
  readonly nameOnCardInput: Locator;
  readonly shippingNameInput: Locator;
  readonly countryInput: Locator;
  readonly placeOrderButton: Locator;
  readonly confirmationMessage: Locator;
  readonly orderIdLabels: Locator;

  constructor(page: Page) {
    this.page = page;

    this.cardForm = page.locator(".form__cc");

    this.creditCardNumberInput = this.fieldByTitle("Credit Card Number");
    this.cvvInput = this.fieldByTitle("CVV Code");
    this.nameOnCardInput = this.fieldByTitle("Name on Card");

    this.expiryMonthSelect = this.cardForm.getByRole("combobox").first();
    this.expiryYearSelect = this.cardForm.getByRole("combobox").last();

    this.shippingNameInput = page.locator(".details__user input").first();

    this.countryInput = page.getByPlaceholder("Select Country");
    this.placeOrderButton = page.locator(".action__submit");
    this.confirmationMessage = page.locator(".hero-primary");
    this.orderIdLabels = page.locator(".em-spacer-1 .ng-star-inserted");
  }

  private fieldByTitle(title: string): Locator {
    return this.cardForm
      .locator(".field")
      .filter({ has: this.page.locator(".title", { hasText: title }) })
      .locator("input");
  }

  async fillCheckoutInfo(
    cardNumber: string,
    month: string,
    year: string,
    cvv: string,
    nameOnCard: string,
    shippingName: string
  ) {
    await this.expiryMonthSelect.selectOption({ label: month });
    await this.expiryYearSelect.selectOption({ label: year });
    await this.cvvInput.fill(cvv);
    await this.nameOnCardInput.fill(nameOnCard);
    await this.creditCardNumberInput.fill(cardNumber);
    await this.shippingNameInput.fill(shippingName);
  }

  async selectCountry(countrySearch: string, country: string) {
    await this.countryInput.click();
    await this.countryInput.pressSequentially(countrySearch, { delay: 100 });

    const option = this.page
      .locator("button")
      .filter({ hasText: new RegExp(`^\\s*${country}\\s*$`) });
    await option.waitFor({ state: "visible" });
    await option.click();
  }

  async placeOrder() {
    await this.placeOrderButton.click();
  }

  async getOrderIds(): Promise<string[]> {
    const texts = await this.orderIdLabels.allTextContents();
    const ids = texts.join(" ").match(/[0-9a-f]{24}/gi) ?? [];
    expect(ids.length, "No order id found on the confirmation page").toBeGreaterThan(0);
    return [...new Set(ids)];
  }
}