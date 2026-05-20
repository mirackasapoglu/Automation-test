import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { CartPage } from '../pages/CartPage';
import { OrdersPage } from '../pages/OrdersPage';
import { ProfilePage } from '../pages/ProfilePage';

test('Kullanıcı yolculuğu - Hesaba Altın Havale Baştan Sona', async ({ page }) => {
  test.setTimeout(180_000);

  const homePage = new HomePage(page);
  const cartPage = new CartPage(page);
  const ordersPage = new OrdersPage(page);
  const profilePage = new ProfilePage(page);

  await test.step('1. Ana sayfayı aç ve sepeti temizle', async () => {
    await homePage.goto();
    await expect(page).toHaveURL(/nadirgold\.work/);
    await expect(page.locator('body')).toBeVisible();

    await cartPage.clearAll();
    await homePage.goto();

    console.log('✓ Ana sayfa açıldı ve sepet temizlendi:', page.url());
  });

  await test.step('2. Popup varsa kapat', async () => {
    const closed = await homePage.closePopupIfVisible();
    console.log(closed ? '✓ Popup kapatıldı' : 'ℹ Popup görünmüyor, devam ediliyor');
  });

  await test.step('3. HESABA ALTIN HAVALE sayfasına git', async () => {
    await page.getByRole('link', { name: 'HESABA ALTIN HAVALE', exact: true }).click();

    const popupCloseButton = page.getByRole('button', { name: 'Popup kapat butonu' });
    if (await popupCloseButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await popupCloseButton.click();
    }

    await expect(page.locator('body')).toBeVisible();
    console.log('✓ Hesaba Altın Havale sayfası açıldı:', page.url());
  });
  await test.step('2. Popup varsa kapat', async () => {
    const closed = await homePage.closePopupIfVisible();
    console.log(closed ? '✓ Popup kapatıldı' : 'ℹ Popup görünmüyor, devam ediliyor');
  });

  await test.step('4. Banka seç ve 20000 TL tutar gir', async () => {
    await page.getByRole('img', { name: 'T.GARANTİ BANKASI A.Ş' }).click();

    const tlInput = page.getByRole('textbox', { name: 'TL' });
    await tlInput.click();
    await tlInput.fill('20000');

    console.log('✓ Garanti Bankası seçildi ve 20000 TL girildi');
  });

  await test.step('5. Hesaba havale yap', async () => {
    await page.getByRole('button', { name: 'HESABA HAVALE YAP' }).click();
    await expect(page.locator('body')).toBeVisible();

    console.log('✓ HESABA HAVALE YAP tıklandı');
  });

await test.step('6. IBAN / hesap seç ve adresi onayla', async () => {

  await page.getByText('TR880006200163600006644187').click();

  await page.waitForTimeout(1000);

  // Test adresi kartını seç
  const testAdresiCard = page
    .locator('div')
    .filter({ hasText: /^Test adresi$/ })
    .first();

  if (await testAdresiCard.isVisible({ timeout: 5000 }).catch(() => false)) {
    await testAdresiCard.click();
  }

  await page.waitForTimeout(1000);

  // Checkbox durumunu kontrol et
  const testAdresiCheckbox = page.getByRole('checkbox', {
    name: 'Test adresi'
  });

  if (await testAdresiCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {

    const isChecked = await testAdresiCheckbox.isChecked();

 
  }

  // Fallback text click
  const adresText = page.getByText(
    'Test adresi+905*******95Rahime GedikKıble Sk. No:34 Line Plaza Kat:1 No:2 ŞERİ'
  );

  if (await adresText.isVisible({ timeout: 3000 }).catch(() => false)) {
    await adresText.click();
  }

  console.log('✓ IBAN seçildi ve Test adresi onaylandı');
});

  await test.step('7. Checkout sayfasını aç ve ön bilgilendirme formunu onayla', async () => {
    await page.goto('https://www.nadirgold.work/checkout');

    await expect(page).not.toHaveURL(/hesap\/giris/);
    await expect(page.locator('body')).toBeVisible();

    await page.getByRole('checkbox', { name: 'Ön bilgilendirme formu ,' }).check();

    console.log('✓ Checkout açıldı ve ön bilgilendirme formu onaylandı');
  });

  await test.step('8. Ödeme yap', async () => {
    await page.getByRole('button', { name: 'ÖDEME YAP' }).click();

    console.log('✓ ÖDEME YAP tıklandı');
  });

  await test.step('9. 3D Secure OTP gir', async () => {
    const otpFrame = page.locator('iframe').nth(1).contentFrame();

    await otpFrame.getByRole('textbox').first().click();
    await otpFrame.getByRole('textbox').first().fill('2');
    await otpFrame.getByRole('textbox').nth(1).fill('0');
    await otpFrame.getByRole('textbox').nth(2).fill('1');
    await otpFrame.getByRole('textbox').nth(3).fill('4');
    await otpFrame.getByRole('textbox').nth(4).fill('0');
    await otpFrame.getByRole('textbox').nth(5).fill('9');

    console.log('✓ OTP girildi');
  });

  await test.step('10. Tebrikler sayfasını doğrula', async () => {
    await expect(page).toHaveURL(/tebrikler/, { timeout: 30_000 });
    await expect(page.locator('body')).toBeVisible();

    console.log('✓ Tebrikler sayfası açıldı:', page.url());
  });

  await test.step('11. Siparişlerim sayfasına bak', async () => {
    await ordersPage.goto();
    await expect(page).not.toHaveURL(/hesap\/giris/);
    await expect(page.locator('body')).toBeVisible();

    console.log('✓ Siparişlerim sayfası açıldı');
  });

  await test.step('12. Profil sayfasına bak', async () => {
    await profilePage.gotoSafe();
    await expect(page).not.toHaveURL(/hesap\/giris/);

    const inputs = await profilePage.inputCount();
    expect(inputs).toBeGreaterThan(0);

    console.log(`✓ Profil sayfası açıldı, ${inputs} form alanı görünüyor`);
  });
});