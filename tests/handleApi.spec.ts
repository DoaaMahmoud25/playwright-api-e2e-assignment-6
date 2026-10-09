import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { LoginPage } from "../pages/client/LoginPage";
import { DashboardPage } from "../pages/client/DashboardPage";
import { CartPage } from "../pages/client/CartPage";
import { CheckoutPage } from "../pages/client/CheckoutPage";
import { OrderPage } from "../pages/client/OrdersPage";

const apiPath = path.join(process.cwd(), "test-data/api.json");
const checkoutPath = path.join(process.cwd(), "test-data/checkout-data.json");


const apiData = JSON.parse(fs.readFileSync(apiPath, "utf-8"));
const checkoutData = JSON.parse(fs.readFileSync(checkoutPath, "utf-8"));

const validUser = apiData.users.find(
  (user: { validity: string }) => String(user.validity).toLowerCase() === "valid"
);
if (!validUser) {
  throw new Error('api.json must contain a user with "validity": "valid"');
}

// API login with 3 accounts: 1 valid and 2 invalid
for (const { testName, userEmail, userPassword, validity, expectedMessage } of apiData.users) {
  test(`api login test - ${testName}`, async ({ page, baseURL }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    if (String(validity).toLowerCase() === "valid") {
      await loginPage.loginWithApi(baseURL as string, { userEmail, userPassword });
      await dashboardPage.open();
      await loginPage.expectLoggedIn();
    } else {
      const message = await loginPage.getApiLoginError(baseURL as string, { userEmail, userPassword });
      expect(message).toContain(expectedMessage);
    }
  });
}

// Valid account: Login via API, then complete the rest via UI
test(`api login for ${validUser.userEmail}, add products, checkout and view order`, async ({ page, baseURL }, testInfo) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);
  const ordersPage = new OrderPage (page);

  
  await loginPage.loginWithApi(baseURL as string, validUser);


  await dashboardPage.open();
  await loginPage.expectLoggedIn();
  await page.screenshot({ path: `screenshots/api-dashboard-${testInfo.project.name}.png` });


  for (const { name, exists } of apiData.products) {
    if (exists) {
      await dashboardPage.addProductToCart(name);
    } else {
      await dashboardPage.expectProductNotListed(name);
    }
  }

  await page.screenshot({ path: `screenshots/api-dashboard-after-add-${testInfo.project.name}.png` })

  
  await dashboardPage.openCart();
  for (const { name, exists } of apiData.products) {
    if (exists) {
      await cartPage.expectProductVisibility(name);
    }
  }
  for (const { name, exists } of apiData.products) {
    if (!exists) {
      await cartPage.expectProductNotInCart(name);
    }
  }
  await page.screenshot({ path: `screenshots/api-cart-${testInfo.project.name}.png` });

  await cartPage.proceedToCheckout();
  await page.screenshot({ path: `screenshots/api-checkout-page-${testInfo.project.name}.png` });

  const { cardNumber, expiryMonth, expiryYear, cvv, nameOnCard, shippingName, countrySearch, country } = checkoutData;
  await checkoutPage.fillCheckoutInfo(cardNumber, expiryMonth, expiryYear, cvv, nameOnCard, shippingName);
  await checkoutPage.selectCountry(countrySearch, country);
  await checkoutPage.placeOrder();

  await expect(checkoutPage.confirmationMessage).toContainText("Thankyou for the order.");
  await page.screenshot({ path: `screenshots/api-order-confirmation-${testInfo.project.name}.png` });

  const orderIds = await checkoutPage.getOrderIds();

  await ordersPage.open();
  await page.screenshot({ path: `screenshots/api-orders-history-${testInfo.project.name}.png` });
  
  for (const orderId of orderIds) {
    await ordersPage.open();
    await ordersPage.viewOrder(orderId);
    await ordersPage.expectOrderId(orderId);
    await page.screenshot({
      path: `screenshots/api-order-${orderId}-${testInfo.project.name}.png`,
    });
  }
});