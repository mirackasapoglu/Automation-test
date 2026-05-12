import { test, expect } from '@playwright/test';

test('Siparisler sayfasi aciliyor', async ({ page }) => {
  await page.goto('/hesabim/siparislerim');
  await page.waitForLoadState('networkidle');

  // Login sayfasina yönlendirilmemeli
  await expect(page).not.toHaveURL(/hesap\/giris/);

  // Sayfa görünmeli
  await expect(page.locator('body')).toBeVisible();
});

test('Siparisler sayfasinda buyuk JS hatalari yok', async ({ page }) => {
  const errors: string[] = [];
  
  page.on('console', msg => {
    // Sadece kritik hataları yakala
    // Cloudflare email decode hatalarını yok say
    if (msg.type() === 'error' && !msg.text().includes('email-decode')) {
      errors.push(msg.text());
    }
  });

  await page.goto('/hesabim/siparislerim');
  await page.waitForLoadState('networkidle');

  // Kritik hata olmamalı
  const criticalErrors = errors.filter(e => !e.includes('querySelectorAll'));
  
  expect(criticalErrors.length).toBe(0);
});
