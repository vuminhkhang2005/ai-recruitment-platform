const { chromium } = require('playwright');
const fs = require('fs');

const BASE = 'http://localhost:5173';
const SHOTS = 'shots/language_switch';
fs.mkdirSync(SHOTS, { recursive: true });

let failures = 0;
const check = (cond, msg) => {
  console.log(`${cond ? 'PASS' : 'FAIL'} - ${msg}`);
  if (!cond) failures++;
};

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
  page.on('pageerror', (e) => consoleErrors.push(e.message));

  console.log('--- Testing Language Switcher ---');

  // 1. Initial load (Default VI)
  await page.goto(BASE + '/');
  await page.waitForSelector('[data-testid="language-switcher"]');
  check(await page.isVisible('[data-testid="language-switcher"]'), 'Language switcher is visible in Navbar');
  
  // Check active VI state
  const viBtn = page.locator('[data-testid="language-switcher"]').first().locator('button[aria-label="Tiếng Việt"]');
  check(await viBtn.getAttribute('aria-pressed') === 'true', 'Default language is VI (aria-pressed=true)');
  check(await page.isVisible('nav a:has-text("Việc làm")'), 'Navbar shows "Việc làm" in VI');
  check(await page.isVisible('nav a:has-text("Công ty")'), 'Navbar shows "Công ty" in VI');
  
  await page.screenshot({ path: `${SHOTS}/01_home_vi.png`, fullPage: false });

  // 2. Click EN to switch to English
  const enBtn = page.locator('[data-testid="language-switcher"]').first().locator('button[aria-label="English"]');
  await enBtn.click();

  // Check if loader appears or page reloads
  await page.waitForTimeout(1000); // allow reload
  await page.waitForSelector('[data-testid="language-switcher"]');

  const enBtnAfter = page.locator('[data-testid="language-switcher"]').first().locator('button[aria-label="English"]');
  check(await enBtnAfter.getAttribute('aria-pressed') === 'true', 'Switched to EN (aria-pressed=true)');
  check(await page.isVisible('nav a:has-text("Jobs")'), 'Navbar shows "Jobs" in EN');
  check(await page.isVisible('nav a:has-text("Companies")'), 'Navbar shows "Companies" in EN');
  check(await page.isVisible('header a:has-text("Sign In")'), 'Navbar shows "Sign In" in EN');

  await page.screenshot({ path: `${SHOTS}/02_home_en.png`, fullPage: false });

  // 3. Check Footer in EN
  const footerText = await page.locator('footer').textContent();
  check(footerText.includes('Candidates') && footerText.includes('Employers'), 'Footer columns translated to English');
  check(await page.locator('footer [data-testid="language-switcher"]').count() > 0, 'Footer contains Language Switcher');

  // 4. Switch back to VI
  const viBtnToRestore = page.locator('[data-testid="language-switcher"]').first().locator('button[aria-label="Tiếng Việt"]');
  await viBtnToRestore.click();
  await page.waitForTimeout(1000); // allow reload
  await page.waitForSelector('[data-testid="language-switcher"]');

  check(await page.isVisible('nav a:has-text("Việc làm")'), 'Restored to VI: Navbar shows "Việc làm"');
  check(await page.isVisible('header a:has-text("Đăng nhập")'), 'Restored to VI: Navbar shows "Đăng nhập"');

  await page.screenshot({ path: `${SHOTS}/03_home_restored_vi.png`, fullPage: false });

  // 5. Check Mobile viewport
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  check(await page.isVisible('header [data-testid="language-switcher"]'), 'Language switcher visible on Mobile Header');
  await page.screenshot({ path: `${SHOTS}/04_mobile_vi.png`, fullPage: false });

  // Open mobile menu
  await page.click('button[aria-label="Mở menu"]');
  await page.waitForTimeout(300);
  check(await page.isVisible('div.md\\:hidden [data-testid="language-switcher"]'), 'Language switcher visible inside Mobile Menu drawer');
  await page.screenshot({ path: `${SHOTS}/05_mobile_menu.png`, fullPage: false });

  check(consoleErrors.length === 0, `No console errors (${consoleErrors.length})`);

  if (failures === 0) {
    console.log('\nResult: ALL LANGUAGE SWITCHER CHECKS PASSED!');
  } else {
    console.log(`\nResult: ${failures} CHECKS FAILED!`);
    process.exit(1);
  }

  await browser.close();
})();
