import { Locator, Page, expect } from "@playwright/test";

export class OrderPage {
    readonly page: Page;
    private readonly ordersButton: Locator;
    private readonly orderRows: Locator;
    private readonly orderIdOnDetails: Locator;


    constructor(page: Page) {
        this.page = page;
        this.ordersButton = page.locator("button[routerlink*='myorders']");
        this.orderRows = page.locator("tbody tr");
        this.orderIdOnDetails = page.locator(".col-text").first();
    }


    async open(): Promise<void> {
        await this.ordersButton.click();
        await this.orderRows.first().waitFor();
    }

    async viewOrder(orderId: string): Promise<void> {
        await this.orderRows
           .filter({ hasText: orderId})
           .getByRole("button", { name: "View"})
           .click();
    }

    async expectOrderId(orderId: string): Promise<void> {
        await expect(
            this.orderIdOnDetails,
            `Expected order id ${orderId} on the order details page`
        ).toContainText(orderId);
    }
}
