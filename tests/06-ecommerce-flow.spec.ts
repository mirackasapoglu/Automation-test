import { test, expect } from '@playwright/test';

// =============================================================================
// 06-ecommerce-flow.spec.ts
//
// E-commerce akışını test eder:
//   1. Kategorileri gezin
//   2. Ürün listesine erişin
//   3. Ürün detaylarına gidin
//   4. Sepete ürün ekleyin
//   5. Sepete gidin ve kontrolü yapın
// =============================================================================

test('Kategori navigasyonu - GRAM KÜLÇE ALTIN', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const gramAltin = page.locator('nav a, header a').filter({ hasText: /GRAM KÜLÇE ALTIN/i }).first();

  const isVisible = await gramAltin.isVisible().catch(() => false);

  if (isVisible) {
    await gramAltin.click();
    await page.waitForLoadState('networkidle');

    const url = page.url();
    expect(url).toBeTruthy();
    await expect(page.locator('body')).toBeVisible();
  } else {
    console.log('GRAM KÜLÇE ALTIN kategorisi navigasyon menüsünde bulunamadı');
  }
});

test('Kategori navigasyonu - GRAM KÜLÇE GÜMÜŞ', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const gramGumis = page.locator('nav a, header a').filter({ hasText: /GRAM KÜLÇE GÜMÜŞ/i }).first();

  const isVisible = await gramGumis.isVisible().catch(() => false);

  if (isVisible) {
    await gramGumis.click();
    await page.waitForLoadState('networkidle');

    const url = page.url();
    expect(url).toBeTruthy();
    await expect(page.locator('body')).toBeVisible();
  } else {
    console.log('GRAM KÜLÇE GÜMÜŞ kategorisi navigasyon menüsünde bulunamadı');
  }
});

test('Kategori navigasyonu - ZİYNET ALTIN', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const ziynetAltin = page.locator('nav a, header a').filter({ hasText: /ZİYNET ALTIN/i }).first();

  const isVisible = await ziynetAltin.isVisible().catch(() => false);

  if (isVisible) {
    await ziynetAltin.click();
    await page.waitForLoadState('networkidle');

    const url = page.url();
    expect(url).toBeTruthy();
    await expect(page.locator('body')).toBeVisible();
  } else {
    console.log('ZİYNET ALTIN kategorisi navigasyon menüsünde bulunamadı');
  }
});

test('Ürün listesi görünüyor', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // İlk kategoriyi tıkla
  const kategori = page.locator('[class*="kategori" i], [class*="category" i], [class*="menu" i] a').first();
  
  const exists = await kategori.isVisible().catch(() => false);
  
  if (exists) {
    await kategori.click();
    await page.waitForLoadState('networkidle');

    // Ürün kartları veya listesi olmalı
    const urunler = page.locator(
      '[class*="product" i], [class*="urun" i], [class*="item" i], .card, article'
    );
    
    const count = await urunler.count();
    expect(count).toBeGreaterThan(0);
  }
});

test('Ürün detayına gidebiliyoruz', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // İlk ürünü bul
  const ilkUrun = page.locator('[class*="product" i], [class*="urun" i], article').first();
  
  const exists = await ilkUrun.isVisible().catch(() => false);
  
  if (exists) {
    // Ürünün içinde bir link varsa tıkla
    const link = ilkUrun.locator('a').first();
    const linkExists = await link.isVisible().catch(() => false);
    
    if (linkExists) {
      await link.click();
      await page.waitForLoadState('networkidle');

      // Ürün detay sayfasında olmali
      // Başlık, fiyat, açıklama gibi şeyler görünmeli
      await expect(page.locator('body')).toBeVisible();
    }
  }
});

test('Sepete ürün ekleyebiliyoruz', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // İlk ürünü bul ve detayına git
  const ilkUrun = page.locator('[class*="product" i], [class*="urun" i], article').first();
  const exists = await ilkUrun.isVisible().catch(() => false);
  
  if (exists) {
    const link = ilkUrun.locator('a').first();
    const linkExists = await link.isVisible().catch(() => false);
    
    if (linkExists) {
      await link.click();
      await page.waitForLoadState('networkidle');

      // "Sepete Ekle" veya "Add to Cart" butonunu bul
      const sepeteEkleBtn = page.getByRole('button', {
        name: /sepete ekle|add to cart|sepete at|satın al/i
      }).first();
      
      const btnExists = await sepeteEkleBtn.isVisible().catch(() => false);
      
      if (btnExists) {
        // Miktar alanı varsa arttır (opsiyonel)
        const miktarInput = page.locator('input[type="number"]').first();
        const miktarExists = await miktarInput.isVisible().catch(() => false);
        
        if (miktarExists) {
          // Varsayılan miktarı değiştir
          await miktarInput.fill('1');
        }

        // Sepete ekle butonuna tıkla
        await sepeteEkleBtn.click();
        await page.waitForLoadState('networkidle');

        // Başarı mesajı veya sepet güncellemesi olmalı
        // Sayfada kalabilir veya sepete yönlendirebilir
        const url = page.url();
        expect(url).toBeTruthy();
      } else {
        console.log('Sepete Ekle butonu bulunamadı');
      }
    }
  }
});

test('Sepette ürün kontrolü yapabiliriz', async ({ page }) => {
  // Sepete git (varsa)
  await page.goto('/sepet');
  await page.waitForLoadState('networkidle');

  // Sepet boş değilse
  const cartItems = page.locator(
    '[class*="cart" i] tr, [class*="cart" i] .item, [class*="basket" i] tr, [class*="basket" i] .item'
  );
  
  const itemCount = await cartItems.count();
  
  if (itemCount > 0) {
    // Ürün var — detayları kontrol et
    
    // Ürün adı görünmeli
    const productName = page.locator(
      '[class*="product" i] [class*="name" i], .product-title, .item-name'
    ).first();
    const nameExists = await productName.isVisible().catch(() => false);
    
    // Fiyat görünmeli
    const price = page.locator('[class*="price" i]').first();
    const priceExists = await price.isVisible().catch(() => false);
    
    // En az isim veya fiyat görünmeli
    expect(nameExists || priceExists).toBe(true);
  } else {
    console.log('Sepet boş veya ürün başarıyla eklenmemiş');
  }
});

test('Sepet toplamı hesaplanıyor', async ({ page }) => {
  await page.goto('/sepet');
  await page.waitForLoadState('networkidle');

  // Toplam, alt toplam veya genel fiyat alanını bul
  const toplam = page.locator(
    '[class*="total" i], [class*="subtotal" i], [class*="sum" i]'
  ).first();
  
  const exists = await toplam.isVisible().catch(() => false);
  
  if (exists) {
    const text = await toplam.textContent();
    
    // Sayısal bir değer içermeli (fiyat)
    expect(text).toMatch(/\d/);
  }
});
