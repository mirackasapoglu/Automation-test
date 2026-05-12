import { test, expect } from '@playwright/test';

test('Profil sayfasi aciliyor', async ({ page }) => {
  await page.goto('/hesabim/uyelik');
  await page.waitForLoadState('networkidle');

  // Login sayfasina yönlendirilmemeli
  await expect(page).not.toHaveURL(/hesap\/giris/);

  // Sayfa görünmeli
  await expect(page.locator('body')).toBeVisible();
});

test('Profil sayfasinda form elemanlari var', async ({ page }) => {
  await page.goto('/hesabim/uyelik');
  await page.waitForLoadState('networkidle');

  // En az bir input olmali
  const inputs = await page.locator('input').count();
  expect(inputs).toBeGreaterThan(0);
});
