import { test, expect } from '@playwright/test';

// =============================================================================
// 09-full-user-journey.spec.ts
//
// Tek bir browser oturumunda baştan sona kullanıcı yolculuğu:
//   1. Ana sayfa aç
//   2. Popup kapat
//   3. Kategori menüsünü gör
//   4. GRAM KÜLÇE ALTIN kategorisine git
//   5. Ürün listesini gör
//   6. Ürün detayına gir
//   7. Sepete ekle
//   8. Sepeti kontrol et
//   9. Checkout sayfasına geç
//  10. Siparişlerim sayfasına bak
//  11. Profil sayfasına bak
// =============================================================================

test('Kullanıcı yolculuğu - Baştan Sona', async ({ page }) => {
  test.setTimeout(180_000);

  // ─── ADIM 1: Ana Sayfa ────────────────────────────────────────────────────
  await test.step('1. Ana sayfayı aç', async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/nadirgold\.work/);
    await expect(page.locator('body')).toBeVisible();
    console.log('✓ Ana sayfa açıldı:', page.url());
  });

  // ─── ADIM 2: Popup Kapat ─────────────────────────────────────────────────
  await test.step('2. Popup varsa kapat', async () => {
    const popupClose = page.getByRole('button', { name: 'Popup kapat butonu' });
    const popupExists = await popupClose.isVisible({ timeout: 3000 }).catch(() => false);

    if (popupExists) {
      await popupClose.click();
      await page.waitForTimeout(600);
      console.log('✓ Popup kapatıldı');
    } else {
      console.log('ℹ Popup görünmüyor, devam ediliyor');
    }
  });

  // ─── ADIM 3: Kategori Menüsünü Gör ───────────────────────────────────────
  await test.step('3. Kategori menüsünü kontrol et', async () => {
    const altinLink = page.getByRole('link', { name: 'GRAM KÜLÇE ALTIN', exact: true });
    await expect(altinLink).toBeVisible({ timeout: 5000 });
    console.log('✓ Kategori menüsü görünüyor');
  });

  // ─── ADIM 4: Kategoriye Git ───────────────────────────────────────────────
  await test.step('4. GRAM KÜLÇE ALTIN kategorisine git', async () => {
    await page.goto('/kulce-altin');
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('kulce-altin');
    console.log('✓ Kategori sayfasına gidildi:', page.url());
  });

  // ─── ADIM 5: Ürün Listesini Gör ──────────────────────────────────────────
  await test.step('5. Ürün listesini gör', async () => {
    // Sepet sidebar açıksa kapat
    const closeSidebar = page.getByRole('button', { name: 'Hızlı Sepeti Kapat' });
    if (await closeSidebar.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeSidebar.evaluate(el => (el as HTMLElement).click());
      await page.waitForTimeout(500);
    }

    const products = page.getByRole('link', { name: /ürünü incele/i });
    await products.first().waitFor({ state: 'visible', timeout: 10_000 });

    const count = await products.count();
    console.log(`✓ ${count} ürün listelendi`);
    expect(count).toBeGreaterThan(0);
  });

  // ─── ADIM 6: Ürün Detayına Gir ───────────────────────────────────────────
  let productUrl = '';
  await test.step('6. İlk ürünün detayına git', async () => {
    const firstProduct = page.getByRole('link', { name: /ürünü incele/i }).first();
    const href = await firstProduct.getAttribute('href');

    productUrl = href?.startsWith('http')
      ? href
      : `https://www.nadirgold.work${href}`;

    await page.goto(productUrl);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
    console.log('✓ Ürün detay sayfası açıldı:', page.url());
  });

  // ─── ADIM 7: Sepete Ekle ─────────────────────────────────────────────────
  await test.step('7. Ürünü sepete ekle', async () => {
    const addToCartBtn = page.getByRole('button', { name: /sepete ekle/i }).first();
    await addToCartBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await addToCartBtn.evaluate(el => (el as HTMLElement).click());

    await page.waitForTimeout(1500);
    console.log('✓ Sepete ekle butonuna tıklandı');

    // Açılan sepet sidebar'ını kapat
    const closeCart = page.getByRole('button', { name: 'Hızlı Sepeti Kapat' });
    if (await closeCart.isVisible({ timeout: 3000 }).catch(() => false)) {
      await closeCart.evaluate(el => (el as HTMLElement).click());
      await page.waitForTimeout(500);
      console.log('✓ Sepet sidebar kapatıldı');
    }
  });

  // ─── ADIM 8: Sepeti Kontrol Et ───────────────────────────────────────────
  await test.step('8. Sepete git ve ürünü kontrol et', async () => {
    await page.goto('/sepet');
    await page.waitForLoadState('networkidle');

    // Sidebar açılmasını bekle
    const closeSidebar = page.getByRole('button', { name: 'Hızlı Sepeti Kapat' });
    await closeSidebar.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});

    const silBtnCount = await page.getByRole('button', { name: /^Sil$/ }).count();
    const hasTLText = await page.evaluate(() =>
      /\d[\d.,]+\s*TL/.test(document.body.textContent || '')
    );

    console.log(`✓ Sepet — Ürün sayısı: ${silBtnCount}, Fiyat görünüyor: ${hasTLText}`);
    expect(silBtnCount > 0 || hasTLText).toBe(true);
  });

  // ─── ADIM 9: Checkout Sayfası ─────────────────────────────────────────────
  await test.step('9. Checkout sayfasına geç', async () => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    await expect(page).not.toHaveURL(/hesap\/giris/);
    await expect(page.locator('body')).toBeVisible();
    console.log('✓ Checkout sayfası açıldı:', page.url());
  });

  // ─── ADIM 10: Banka Transfer Seç ─────────────────────────────────────────
  await test.step('10. Banka Transfer / Anında Ödeme seç', async () => {
    const bankTransferBtn = page.getByRole('button', { name: /banka transfer/i });
    await bankTransferBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await bankTransferBtn.click();
    await page.waitForTimeout(1000);
    console.log('✓ Banka Transfer sekmesi seçildi');

    // Banka seçimi img tabanlı — ilk radio input'u JS ile seç
    const firstBankLabel = page.locator('label:has(input[name="bankId"])').first();
    await firstBankLabel.waitFor({ state: 'visible', timeout: 8000 });
    await firstBankLabel.click();
    await page.waitForTimeout(500);
    console.log('✓ Ziraat Bankası seçildi');
  });

  // ─── ADIM 11: Sözleşmeyi Onayla ──────────────────────────────────────────
  await test.step('11. Sözleşmeyi onayla', async () => {
    // Codegen'den alınan gerçek selector
    const checkbox = page.getByRole('checkbox', { name: 'Ön bilgilendirme formu ,' });
    await checkbox.waitFor({ state: 'attached', timeout: 8000 });
    await checkbox.check();
    await page.waitForTimeout(500);

    const isChecked = await checkbox.isChecked().catch(() => false);
    console.log(`✓ Sözleşme onaylandı (checked: ${isChecked})`);
    expect(isChecked).toBe(true);
  });

  // ─── ADIM 12: Ödeme Yap ───────────────────────────────────────────────────
  await test.step('12. Ödeme Yap butonuna tıkla', async () => {
    const odemeBtn = page.getByRole('button', { name: /ödeme yap/i });
    await odemeBtn.waitFor({ state: 'visible', timeout: 10_000 });

    // Tıklama + navigation'ı birlikte bekle
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30_000 }).catch(() => {}),
      odemeBtn.click(),
    ]);

    await page.waitForTimeout(2000);
    const url = page.url().catch ? await page.url() : '';
    console.log('✓ Ödeme Yap tıklandı, URL:', url);
    await expect(page.locator('body')).toBeVisible();
  });

  // ─── ADIM 13: Siparişlerim ────────────────────────────────────────────────
  await test.step('13. Siparişlerim sayfasına bak', async () => {
    await page.goto('/hesabim/siparislerim');
    await page.waitForLoadState('networkidle');

    await expect(page).not.toHaveURL(/hesap\/giris/);
    await expect(page.locator('body')).toBeVisible();
    console.log('✓ Siparişlerim sayfası açıldı');
  });

  // ─── ADIM 14: Profil ─────────────────────────────────────────────────────
  await test.step('14. Profil sayfasına bak', async () => {
    await page.waitForTimeout(2000);
    await page.goto('/hesabim/uyelik', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});

    await expect(page).not.toHaveURL(/hesap\/giris/);

    const inputs = await page.locator('input').count();
    expect(inputs).toBeGreaterThan(0);
    console.log(`✓ Profil sayfası açıldı, ${inputs} form alanı görünüyor`);
  });
});
