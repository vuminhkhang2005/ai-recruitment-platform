import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('Launching Chromium...');
  const browser = await chromium.launch({
    headless: true,
  });

  // 1. Desktop Test (1440 x 900)
  console.log('Running Desktop 1440x900 tests...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // Retina quality
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:4173', { waitUntil: 'networkidle' });

  // Full page screenshot
  await desktopPage.screenshot({
    path: path.join(SCREENSHOT_DIR, '01-desktop-full.png'),
    fullPage: true,
  });
  console.log('Saved 01-desktop-full.png');

  // Viewport screenshot of Hero & Scanner
  await desktopPage.screenshot({
    path: path.join(SCREENSHOT_DIR, '02-desktop-hero.png'),
  });
  console.log('Saved 02-desktop-hero.png');

  // Test interactive CV Scanner
  console.log('Testing CV Scanner simulation...');
  const scanButton = desktopPage.locator('text=Quét lại CV').or(desktopPage.locator('text=Tải lên & Quét thử'));
  if (await scanButton.count() > 0) {
    await scanButton.first().click();
    await desktopPage.waitForTimeout(2500); // Wait for simulation steps to finish
    await desktopPage.screenshot({
      path: path.join(SCREENSHOT_DIR, '03-desktop-cv-scanned.png'),
    });
    console.log('Saved 03-desktop-cv-scanned.png');
  }

  // Test Search & Filter
  console.log('Testing Job Search & Filter...');
  const searchInput = desktopPage.locator('input[placeholder*="Chức danh"]').first();
  if (await searchInput.count() > 0) {
    await searchInput.fill('Python');
    await desktopPage.keyboard.press('Enter');
    await desktopPage.waitForTimeout(500);
  }

  // Test Job Detail Modal
  console.log('Testing Job Detail Modal...');
  const viewDetailsBtn = desktopPage.locator('button:has-text("Chi tiết & AI Match")').first();
  if (await viewDetailsBtn.count() > 0) {
    await viewDetailsBtn.click();
    await desktopPage.waitForTimeout(600);
    
    // Click AI cover letter generator
    const aiLetterBtn = desktopPage.locator('button:has-text("Tự động soạn bằng AI")').first();
    if (await aiLetterBtn.count() > 0) {
      await aiLetterBtn.click();
      await desktopPage.waitForTimeout(1200);
    }

    await desktopPage.screenshot({
      path: path.join(SCREENSHOT_DIR, '04-desktop-job-modal.png'),
    });
    console.log('Saved 04-desktop-job-modal.png');

    // Close modal
    const closeBtn = desktopPage.locator('button[aria-label="Đóng"]').or(desktopPage.locator('button:has-text("Đóng")')).first();
    if (await closeBtn.count() > 0) {
      await closeBtn.click();
      await desktopPage.waitForTimeout(400);
    }
  }

  // Test Auth Modal
  console.log('Testing Auth Modal...');
  const loginNavBtn = desktopPage.locator('button:has-text("Đăng nhập")').first();
  if (await loginNavBtn.count() > 0) {
    await loginNavBtn.click();
    await desktopPage.waitForTimeout(500);
    await desktopPage.screenshot({
      path: path.join(SCREENSHOT_DIR, '05-desktop-auth-modal.png'),
    });
    console.log('Saved 05-desktop-auth-modal.png');

    // Close auth modal
    const closeAuthBtn = desktopPage.locator('button[aria-label="Đóng"]').first();
    if (await closeAuthBtn.count() > 0) {
      await closeAuthBtn.click();
      await desktopPage.waitForTimeout(600);
    }
  }

  // Switch role to Recruiter
  console.log('Testing Role Switcher...');
  const recruiterToggle = desktopPage.locator('button:has-text("Nhà tuyển dụng")').first();
  if (await recruiterToggle.count() > 0) {
    await recruiterToggle.click({ force: true });
    await desktopPage.waitForTimeout(600);
    await desktopPage.screenshot({
      path: path.join(SCREENSHOT_DIR, '06-desktop-recruiter-mode.png'),
    });
    console.log('Saved 06-desktop-recruiter-mode.png');
  }

  await desktopContext.close();

  // 2. Tablet Test (768 x 1024)
  console.log('Running Tablet 768x1024 tests...');
  const tabletContext = await browser.newContext({
    viewport: { width: 768, height: 1024 },
    deviceScaleFactor: 2,
  });
  const tabletPage = await tabletContext.newPage();
  await tabletPage.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await tabletPage.screenshot({
    path: path.join(SCREENSHOT_DIR, '07-tablet-full.png'),
    fullPage: true,
  });
  console.log('Saved 07-tablet-full.png');
  await tabletContext.close();

  // 3. Mobile Test (390 x 844 iPhone 14 style)
  console.log('Running Mobile 390x844 tests...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await mobilePage.screenshot({
    path: path.join(SCREENSHOT_DIR, '08-mobile-full.png'),
    fullPage: true,
  });
  console.log('Saved 08-mobile-full.png');

  // Test Mobile Navigation Drawer
  const mobileMenuBtn = mobilePage.locator('button[aria-label="Mở menu điều hướng"]').first();
  if (await mobileMenuBtn.count() > 0) {
    await mobileMenuBtn.click();
    await mobilePage.waitForTimeout(500);
    await mobilePage.screenshot({
      path: path.join(SCREENSHOT_DIR, '09-mobile-drawer.png'),
    });
    console.log('Saved 09-mobile-drawer.png');
  }

  await mobileContext.close();
  await browser.close();
  console.log('All automation UI tests and screenshots completed successfully!');
}

run().catch((err) => {
  console.error('Playwright automation error:', err);
  process.exit(1);
});
