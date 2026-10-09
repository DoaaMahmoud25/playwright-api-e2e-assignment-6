import { APIRequestContext, expect, request } from "@playwright/test";

export type LoginCredentials = {
    userEmail : string;
    userPassword : string;
};


export class AuthApi{
    private constructor(private readonly apiContext: APIRequestContext){}

    static async create(baseURL: string): Promise<AuthApi>{
        const apiContext = await request.newContext({ baseURL });
        return new AuthApi(apiContext);
    }


    async login({ userEmail, userPassword }: LoginCredentials): Promise<string> {
        const loginResponse = await this.apiContext.post("/api/ecom/auth/login", {
            data: { userEmail, userPassword },
    });


    expect(
      loginResponse.ok(),
     `Login Failed for ${userEmail}: ${await loginResponse.text()}`
    ).toBeTruthy();
    
    const loginResponseJson = await loginResponse.json();
    expect(
      loginResponseJson.token,
      "Login response missing token"
    ).toBeTruthy();

    return loginResponseJson.token as string; 
}

// For invalid accounts: assert that the login fails and return the error message.
    async loginExpectFailure({ userEmail, userPassword }: LoginCredentials): Promise<string>{
      const loginResponse = await this.apiContext.post("/api/ecom/auth/login", {
        data:{ userEmail, userPassword },
      });

      expect(
        loginResponse.ok(),
        `Login unexpectedly succeeded for ${userEmail}`
      ).toBeFalsy();

      const loginResponseJson = await loginResponse.json();
      return loginResponseJson.message as string;
    }

    async dispose(): Promise<void>{
        await this.apiContext.dispose();
    }


}