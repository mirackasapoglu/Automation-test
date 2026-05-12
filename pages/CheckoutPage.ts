import { Page, Locator } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly bankTransferButton: Locator;
  readonly firstBankLabel: Locator;
  readonly agreementCheckbox: Locator;
  readonly payButton: Locator;
  readonly addressLabel: Locator;
  readonly paymentHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.bankTransferButton = page.getByRole('button', { name: /banka transfer/i });
    this.firstBankLabel = page.locator('label:has(input[name="bankId"])').first();
    this.agreementCheckbox = page.getByRole('checkbox', { name: 'Ön bilgilendirme formu ,' });
    this.payButton = page.getByRole('button', { name: /ödeme yap/i });
    this.addressLabel = page.getByText(/gönderim adresi|teslimat adresi|delivery address/i);
    this.paymentHeading = page.getByText(/ödeme seçenekleri|ödeme yöntemi|payment method/i);
  }

  async goto() {
    await this.page.goto('/checkout');
    await this.page.waitForLoadState('networkidle');
  }

  async selectBankTransfer() {
    await this.bankTransferButton.waitFor({ state: 'visible', timeout: 10_000 });
    await this.bankTransferButton.click();
    await this.page.waitForTimeout(1000);
  }

  async selectFirstBank() {
    await this.firstBankLabel.waitFor({ state: 'visible', timeout: 8000 });
    await this.firstBankLabel.click();
    await this.page.waitForTimeout(500);
  }

  async acceptAgreement() {
    await this.agreementCheckbox.waitFor({ state: 'attached', timeout: 8000 });
    await this.agreementCheckbox.check();
    await this.page.waitForTimeout(500);
  }

  async isAgreementChecked(): Promise<boolean> {
    return this.agreementCheckbox.isChecked().catch(() => false);
  }

  async pay() {
    await this.payButton.waitFor({ state: 'visible', timeout: 10_000 });
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30_000 }).catch(() => {}),
      this.payButton.click(),
    ]);
    await this.page.waitForTimeout(2000);
  }
}
