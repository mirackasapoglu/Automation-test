import { Page } from '@playwright/test';

export class OrdersPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/hesabim/siparislerim');
    await this.page.waitForLoadState('networkidle');
  }

  isAuthenticated(): boolean {
    return !this.page.url().includes('hesap/giris');
  }
}
