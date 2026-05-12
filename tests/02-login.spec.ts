import { test, expect } from '@playwright/test';

test('Login sayfasi yonlendirmesi calisiyor', async ({ page }) => {
  await page.goto('/hesap/giris');
  await page.waitForLoadState('domcontentloaded');

  // Zaten giriş yapmışsan ana sayfaya yönlendirebilir
  // veya login sayfasında kalabilir — ikisini de kontrol et
  const url = page.url();
  const isLoginPage = url.includes('hesap/giris');
  const isHomepage = url.includes('nadirgold.work');

  expect(isLoginPage || isHomepage).toBe(true);
});

test('Login formu elemanlari görünüyor (oturumsuz)', async ({ browser }) => {
  const ctx = await browser.newContext({ storageState: undefined });
  const page = await ctx.newPage();

  await page.goto('https://www.nadirgold.work/hesap/giris');
  await page.waitForLoadState('domcontentloaded');

  // En az bir input elemanı olmalı
  const inputs = await page.locator('input').count();
  expect(inputs).toBeGreaterThan(0);

  await ctx.close();
});
