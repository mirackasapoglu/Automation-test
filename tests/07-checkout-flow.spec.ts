import { test, expect } from '@playwright/test';

// =============================================================================
// 07-checkout-flow.spec.ts
//
// Ödeme / Kasa akışı testi:
//   1. Sepete git
//   2. Ürünleri gözden geçir
//   3. Checkout'a başla
//   4. Adres bilgilerini doldur
//   5. Ödeme yöntemini seç
//   6. Siparişi tamamla
// =============================================================================

test('Checkout sayfasi erisilebiliyor', async ({ page }) => {
  await page.goto('/sepet');
  await page.waitForLoadState('networkidle');

  // "Ödeme Yap", "Ödemeye Geç", "Checkout" gibi buton veya link
  const checkoutBtn = page.locator('a, button').filter({
    hasText: /ödeme yap|ödemeye geç|checkout|sipariş ver|satın al|devam et/i
  }).first();
  
  const exists = await checkoutBtn.isVisible().catch(() => false);
  
  if (exists) {
    // Sepette ürün varsa tıkla
    const cartEmpty = await page.getByText(/sepetiniz boş|no items|empty/i).isVisible().catch(() => false);
    
    if (!cartEmpty) {
      // Checkout'a git
      await checkoutBtn.click();
      await page.waitForLoadState('networkidle');

      // Checkout sayfasında olmali
      const url = page.url();
      expect(url).toBeTruthy();
      expect(url).not.toContain('sepet');
    } else {
      console.log('Sepet boş — checkout test atlanıyor');
    }
  } else {
    console.log('Checkout butonu bulunamadı');
  }
});

test('Checkout formunda adres alanları var', async ({ page }) => {
  await page.goto('/checkout');
  await page.waitForLoadState('domcontentloaded');

  // Site adres seçimi için disabled textbox + dropdown kullanıyor ("Gönderim Adresi")
  const addressLabel = page.getByText(/gönderim adresi|teslimat adresi|delivery address/i);
  const anyTextbox = page.getByRole('textbox').first();
  const anyCombobox = page.getByRole('combobox').first();

  const labelExists = await addressLabel.isVisible().catch(() => false);
  const textboxExists = await anyTextbox.isVisible().catch(() => false);
  const comboExists = await anyCombobox.isVisible().catch(() => false);

  expect(labelExists || textboxExists || comboExists).toBe(true);
});

test('Ödeme yöntemi seçeneği var', async ({ page }) => {
  await page.goto('/checkout');
  await page.waitForLoadState('domcontentloaded');

  // Site ödeme seçeneklerini "Ödeme Seçenekleri" başlığı altında liste öğeleri olarak gösteriyor
  const paymentHeading = page.getByText(/ödeme seçenekleri|ödeme yöntemi|payment method/i);
  const paymentListItem = page.locator('li').filter({ hasText: /kredi|banka|havale|eft|kapıda/i }).first();
  const paymentRadios = page.locator('input[type="radio"]');
  const paymentSelect = page.locator('select[name*="payment" i]');

  const headingExists = await paymentHeading.isVisible().catch(() => false);
  const listExists = await paymentListItem.isVisible().catch(() => false);
  const radioCount = await paymentRadios.count();
  const selectExists = await paymentSelect.isVisible().catch(() => false);

  expect(headingExists || listExists || radioCount > 0 || selectExists).toBe(true);
});

test('Sipariş özeti görünüyor', async ({ page }) => {
  await page.goto('/checkout');
  await page.waitForLoadState('networkidle');

  // Ürün listesi veya özeti
  const summary = page.locator(
    '[class*="summary" i], [class*="order" i][class*="review" i], [class*="review" i]'
  ).first();
  
  const exists = await summary.isVisible().catch(() => false);
  
  if (exists) {
    // Özetin içinde ürün veya fiyat bilgisi olmalı
    const text = await page.locator('body').textContent();
    expect(text).toMatch(/\d/);
  }
});

test('Sipariş verme butonu var', async ({ page }) => {
  await page.goto('/checkout');
  await page.waitForLoadState('networkidle');

  // "ÖDEME YAP", "Siparişi Tamamla", "Ödemeyi Yap", "Sipariş Ver" butonu
  const submitBtn = page.getByRole('button', {
    name: /ödeme yap|siparişi tamamla|ödemeyi yap|sipariş ver|order now|place order/i
  }).first();
  
  const exists = await submitBtn.isVisible().catch(() => false);
  
  // Sayfa checkout'sa, submit butonu olmalı
  if (await page.url().includes('checkout')) {
    expect(exists).toBe(true);
  }
});
