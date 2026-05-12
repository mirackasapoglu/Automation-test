import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/hesap/giris');
    await this.page.waitForLoadState('networkidle');
  }

  async assertOpened() {
    await expect(this.page).toHaveURL(/hesap\/giris/);
  }
}
