import { test, expect } from '@playwright/test';

test('Homepage - sayfa basarili aciliyor', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await expect(page).toHaveURL(/nadirgold\.work/);
  await expect(page.locator('body')).toBeVisible();
});

test('Homepage - sayfa basligi var', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await expect(page).toHaveTitle(/.+/);
});

test('Homepage - login sayfasina yonlendirme yok (oturum gecerli)', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await expect(page).not.toHaveURL(/hesap\/giris/);
});
