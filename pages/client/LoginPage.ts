import { Page, expect } from "@playwright/test";
import { AuthApi, LoginCredentials } from "../../api/AuthApi";
import { TokenHelper } from "../../utils/TokenHelper";

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

   
  private assertCredentials({ userEmail, userPassword }: LoginCredentials): void {
    if (!userEmail || !userPassword) {
      throw new Error(
        "Login data is missing userEmail/userPassword. Check the keys in test-data/api.json"
      );
    }
  }

  
  async loginWithApi(baseURL: string, credentials: LoginCredentials): Promise<void> {
    this.assertCredentials(credentials);

    const authApi = await AuthApi.create(baseURL);
    try {
      const token = await authApi.login(credentials);
      await TokenHelper.inject(this.page, token);
    } finally {
      await authApi.dispose();
    }
  }

  
  async getApiLoginError(baseURL: string, credentials: LoginCredentials): Promise<string> {
    this.assertCredentials(credentials);

    const authApi = await AuthApi.create(baseURL);
    try {
      return await authApi.loginExpectFailure(credentials);
    } finally {
      await authApi.dispose();
    }
  }

  async expectLoggedIn(): Promise<void> {
    await expect(
      this.page,
      "Expected to land on the dashboard after API login"
    ).toHaveURL(/dashboard/);
  }
}