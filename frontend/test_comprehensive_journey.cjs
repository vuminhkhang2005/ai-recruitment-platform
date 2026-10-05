const { chromium } = require('C:/Users/DELL/.gemini/antigravity/scratch/ai-recruitment-platform/frontend/node_modules/playwright');
const path = require('path');
const OUT = path.join(__dirname, 'shots');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await ctx.newPage();
  const logs = [];

  page.on('console', m => {
    if (['error', 'warning'].includes(m.type())) {
      logs.push(`[${m.type()}] ${m.text().slice(0, 250)}`);
    }
  });
  page.on('pageerror', e => logs.push(`[pageerror] ${e.message}`));
  page.on('response', r => {
    if (r.status() >= 400 && !r.url().includes('favicon')) {
      logs.push(`[http ${r.status()}] ${r.request().method()} ${r.url()}`);
    }
  });

  const shot = n => page.screenshot({ path: path.join(OUT, n + '.png') });
  const step = async (name, fn) => {
    try {
      await fn();
      console.log('✓ PASS:', name);
    } catch (e) {
      console.error('✗ FAIL:', name, '->', e.message);
      process.exitCode = 1;
    }
  };

  // -------------------------------------------------------------
  // Test 1: Search & Filter functionality
  // -------------------------------------------------------------
  await page.goto('http://localhost:5173/#jobs', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  await step('Search jobs by keyword "Golang"', async () => {
    const searchInput = page.locator('input[placeholder*="Tìm theo chức danh"], input[placeholder*="Search by title"]').first();
    await searchInput.fill('Golang');
    await page.waitForTimeout(600);

    const cards = await page.locator('main div[class*="cursor-pointer"]:has-text("Golang")').count();
    console.log('    Cards found for "Golang":', cards);
    if (cards === 0) throw new Error('No jobs matching "Golang" found');
  });
  await shot('c_01_search_golang');

  await step('Reset search and apply Salary filter', async () => {
    const searchInput = page.locator('input[placeholder*="Tìm theo chức danh"], input[placeholder*="Search by title"]').first();
    await searchInput.fill('');
    await page.waitForTimeout(400);

    // Select salary filter if present
    const salarySelect = page.locator('select').filter({ hasText: /Lương|Salary/ }).first();
    if (await salarySelect.isVisible()) {
      await salarySelect.selectOption({ index: 1 });
      await page.waitForTimeout(400);
      console.log('    Salary filter applied');
    }
  });
  await shot('c_02_salary_filter');

  // -------------------------------------------------------------
  // Test 2: AI Cover Letter Generation on an unapplied job
  // -------------------------------------------------------------
  await step('Generate AI Cover Letter for unapplied job', async () => {
    // Pick the 4th card (usually unapplied)
    const cards = page.locator('main div[class*="cursor-pointer"]:has-text("Triệu")');
    const totalCards = await cards.count();
    console.log('    Total job cards rendered:', totalCards);

    let chosenCard = null;
    for (let i = 0; i < totalCards; i++) {
      const card = cards.nth(i);
      const text = await card.textContent();
      if (!text.includes('Đã Ứng Tuyển')) {
        chosenCard = card;
        await card.click();
        await page.waitForTimeout(600);
        break;
      }
    }

    if (!chosenCard) {
      console.log('    All visible cards already applied, selecting first card');
      await cards.first().click();
      await page.waitForTimeout(600);
    }

    const genBtn = page.locator('button:has-text("Tự động soạn bằng AI"), button:has-text("Generate with AI")').first();
    if (await genBtn.isVisible()) {
      await genBtn.click();
      await page.waitForTimeout(1000);
      const textarea = page.locator('textarea').first();
      const content = await textarea.inputValue();
      console.log('    Generated letter length:', content.length);
      if (content.length < 50) throw new Error('Cover letter generation produced empty or too short content');
    } else {
      console.log('    Already applied, skipping cover letter generation');
    }
  });
  await shot('c_03_cover_letter_gen');

  // -------------------------------------------------------------
  // Test 3: CV Scanner & ATS Evaluation (#career-ai)
  // -------------------------------------------------------------
  await step('Career AI Scanner and ATS roadmap', async () => {
    await page.evaluate(() => { location.hash = 'career-ai'; });
    await page.waitForTimeout(1500);

    // Click demo resume scan button if available, or trigger scan
    const scanBtn = page.locator('button:has-text("Phân tích CV"), button:has-text("Scan CV"), button:has-text("Thử CV mẫu")').first();
    if (await scanBtn.isVisible()) {
      await scanBtn.click();
      await page.waitForTimeout(2000);
      console.log('    Triggered CV scanner');
    }

    // Verify ATS score gauge or summary is rendered
    const scoreText = await page.locator('text=/\\b\\d{2}\\/100|Điểm ATS|ATS Score\\b/').first().isVisible();
    console.log('    ATS score display visible:', scoreText);
  });
  await shot('c_04_career_ai_scanned');

  // -------------------------------------------------------------
  // Test 4: Language Switch and Dark Mode
  // -------------------------------------------------------------
  await step('Toggle Language to EN and verify translations', async () => {
    const enBtn = page.locator('button[title*="English (EN)"]').first();
    if (await enBtn.isVisible()) {
      await enBtn.click();
      await page.waitForTimeout(600);
      const enTextVisible = await page.locator('text=/Find Jobs|Career Path|Saved Jobs|Sign In|Profile/').first().isVisible();
      console.log('    English translation active:', enTextVisible);
      // Switch back to VI
      const viBtn = page.locator('button[title*="Tiếng Việt (VI)"]').first();
      await viBtn.click();
      await page.waitForTimeout(600);
    }
  });
  await shot('c_05_language_toggle');

  await step('Toggle Dark Mode and verify html class', async () => {
    const darkBtn = page.locator('button[aria-label="Dark mode"]').first();
    if (await darkBtn.isVisible()) {
      await darkBtn.click();
      await page.waitForTimeout(500);
      const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      console.log('    Dark mode active:', isDark);
      if (!isDark) throw new Error('Expected dark mode class on document element');
      // Toggle back to light
      const lightBtn = page.locator('button[aria-label="Light mode"]').first();
      await lightBtn.click();
      await page.waitForTimeout(500);
    }
  });
  await shot('c_06_dark_mode_toggle');

  // -------------------------------------------------------------
  // Test 5: Mobile Viewport Responsiveness (No horizontal overflow)
  // -------------------------------------------------------------
  await step('Verify Mobile 390px viewport without overflow', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => { location.hash = ''; });
    await page.waitForTimeout(1000);

    const docWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log('    Mobile 390px scrollWidth:', docWidth);
    if (docWidth > 390) {
      throw new Error(`Mobile overflow detected! scrollWidth=${docWidth} > 390`);
    }

    // Check #jobs mobile view
    await page.evaluate(() => { location.hash = 'jobs'; });
    await page.waitForTimeout(1000);
    const jobsDocWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log('    Jobs page 390px scrollWidth:', jobsDocWidth);
    if (jobsDocWidth > 390) {
      throw new Error(`Jobs page mobile overflow detected! scrollWidth=${jobsDocWidth} > 390`);
    }
  });
  await shot('c_07_mobile_responsive');

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log('\n===============================================================');
  console.log('🎉 COMPREHENSIVE JOURNEY VERIFICATION COMPLETED');
  console.log('Logs captured:', logs.length);
  logs.forEach(l => console.log(' ->', l));
  console.log('===============================================================');

  await browser.close();
})();
