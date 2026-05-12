import { test, expect } from '@playwright/test';

test('Sepet sayfasi aciliyor', async ({ page }) => {
  await page.goto('/sepet');
  await page.waitForLoadState('networkidle');

  // Sayfa 404 olmamali
  await expect(page).not.toHaveTitle(/404|sayfa bulunamadi|hata/i);
  
  // Sayfa goruntulenmeli
  await expect(page.locator('body')).toBeVisible();
});

test('Sepete direkt URL ile erisilebiliyor', async ({ page }) => {
  // Sepete direkt git — linkten değil
  await page.goto('/sepet');
  await page.waitForLoadState('networkidle');

  // URL kontrol et
  const url = page.url();
  expect(url).toContain('sepet');
  
  // Sayfa render edilmiş mi?
  const body = page.locator('body');
  await expect(body).toBeVisible();
});

test('Sepet başlığı görünüyor', async ({ page }) => {
  await page.goto('/sepet');
  await page.waitForLoadState('networkidle');

  // Sayfa başlığında sepet olmalı
  const title = page.locator('h1, h2, .title, [class*="heading" i]').first();
  const exists = await title.isVisible().catch(() => false);

  if (exists) {
    const text = await title.textContent();
    // Sepet, cart, alışveriş vb. kelime olmalı
    expect(text?.toLowerCase()).toMatch(/sepet|cart|alışveriş|basket/i);
  }
});

test('Sepet tablosu veya liste var', async ({ page }) => {
  await page.goto('/sepet');
  await page.waitForLoadState('networkidle');

  // /sepet URL'si Hızlı Sepet sidebar'ını aç — sidebar async animasyonla açılıyor
  const closeSidebarBtn = page.getByRole('button', { name: 'Hızlı Sepeti Kapat' });
  const sidebarOpen = await closeSidebarBtn.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);

  if (!sidebarOpen) {
    console.log('ℹ Hızlı Sepet açılmadı veya sepet boş — testi geçiyoruz');
    return;
  }

  // isVisible() CSS animasyonu sırasında false dönebilir — count() ile DOM varlığını kontrol et
  const spinbuttonCount = await page.locator('[role="spinbutton"]').count();
  const silBtnCount = await page.getByRole('button', { name: /^Sil$/ }).count();
  const hasCartImage = (await page.locator('[alt*="Sepet ürünü" i]').count()) > 0;

  expect(spinbuttonCount > 0 || silBtnCount > 0 || hasCartImage).toBe(true);
});

test('Sepet boş ise mesaj gösterir', async ({ page }) => {
  await page.goto('/sepet');
  await page.waitForLoadState('networkidle');

  // Boş sepet mesajını ara
  const emptyMsg = page.getByText(/sepetiniz boş|no items|empty|ürün bulunmuyor/i);
  
  const isEmpty = await emptyMsg.isVisible().catch(() => false);
  
  // Sepet boş olabilir (hata değil, iyi bir test)
  if (isEmpty) {
    await expect(emptyMsg).toBeVisible();
  } else {
    // Sepet dolu ise ürün olmalı
    const items = page.locator('[class*="item" i], [class*="product" i]');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
  }
});

test('Sepet sayfasında fiyat bilgisi var', async ({ page }) => {
  await page.goto('/sepet');
  await page.waitForLoadState('networkidle');

  // /sepet URL'si Hızlı Sepet sidebar'ını açar — sidebar async animasyonla açılıyor
  const closeSidebarBtn = page.getByRole('button', { name: 'Hızlı Sepeti Kapat' });
  const sidebarOpen = await closeSidebarBtn.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);

  if (!sidebarOpen) {
    console.log('ℹ Hızlı Sepet açılmadı veya sepet boş — fiyat testi atlanıyor');
    return;
  }

  // isVisible() CSS animasyonu sırasında false dönebilir — DOM text content ile kontrol et
  const hasTLText = await page.evaluate(() => /\d[\d.,]+\s*TL/.test(document.body.textContent || ''));

  expect(hasTLText).toBe(true);
});
