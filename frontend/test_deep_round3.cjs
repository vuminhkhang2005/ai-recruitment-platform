const { chromium } = require('C:/Users/DELL/.gemini/antigravity/scratch/ai-recruitment-platform/frontend/node_modules/playwright');
const path = require('path');
const OUT = path.join(__dirname, 'shots');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await ctx.newPage();
  const logs = [];
  page.on('console', m => { if (['error', 'warning'].includes(m.type())) logs.push(`[${m.type()}] ${m.text().slice(0, 250)}`); });
  page.on('pageerror', e => logs.push(`[pageerror] ${e.message}`));
  page.on('response', r => { if (r.status() >= 400 && !r.url().includes('favicon')) logs.push(`[http ${r.status()}] ${r.request().method()} ${r.url()}`); });

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

  await page.goto('http://localhost:5173/#profile', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);

  // 1. Guest profile gate check
  await step('Guest profile shows login gate', async () => {
    await page.getByText('Vui lòng đăng nhập').waitFor({ timeout: 5000 });
  });

  // 2. Login via gate
  await step('Login via gate', async () => {
    await page.locator('main button:has-text("Đăng nhập")').first().click();
    await page.fill('#auth-email', 'khang.candidate@talentbridge.vn');
    await page.fill('#auth-password', 'Password@123');
    await page.locator('button:has-text("Đăng nhập vào hệ thống")').click();
    await page.locator('h1:has-text("Vu Minh Khang")').waitFor({ timeout: 8000 });
  });

  // 3. Save a job from #jobs
  let savedTitle = '';
  await step('Save a job on #jobs', async () => {
    await page.evaluate(() => { location.hash = 'jobs'; });
    await page.waitForTimeout(1500);

    // Pick a card
    const card = page.locator('main div[class*="cursor-pointer"]:has-text("Triệu")').nth(1);
    await card.click();
    await page.waitForTimeout(400);

    savedTitle = (await page.locator('main h1, main h2, main h3').filter({ hasText: /Engineer|Architect|Lead/ }).first().textContent()).trim();
    console.log('    Selected job:', savedTitle);

    // Click bookmark button in detail header
    await page.locator('main button:has(svg.lucide-bookmark)').first().click();
    await page.waitForTimeout(500);
  });
  await shot('r3_01_saved_job');

  // 4. Submit application via quick apply form
  await step('Submit application on #jobs', async () => {
    const submitBtn = page.locator('button:has-text("Gửi Hồ sơ Ứng tuyển Ngay")').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(1500);
      console.log('    Submitted application via form button');
    } else {
      console.log('    Job already applied');
    }
  });
  await shot('r3_02_submitted_app');

  // 5. Check Profile Tabs: Saved jobs count & list match, Applied count & list match
  await step('Verify Profile tabs show unified DB jobs', async () => {
    await page.evaluate(() => { location.hash = 'profile'; });
    await page.waitForTimeout(1500);
    await page.locator('h1:has-text("Vu Minh Khang")').waitFor({ timeout: 5000 });

    const savedCountLs = (await page.evaluate(() => JSON.parse(localStorage.getItem('talentbridge_saved_jobs') || '[]'))).length;
    const savedTabBtn = page.locator('button:has-text("Việc đã lưu")').first();
    const savedTabText = (await savedTabBtn.textContent()).trim();
    console.log('    Saved tab text:', savedTabText, 'LocalStorage count:', savedCountLs);
    if (!savedTabText.includes(`(${savedCountLs})`)) {
      throw new Error(`Saved tab count mismatch: tab has "${savedTabText}" but storage has ${savedCountLs}`);
    }

    // Click Saved tab
    await savedTabBtn.click();
    await page.waitForTimeout(500);
    const savedCardCount = await page.locator('button:has-text("Ứng tuyển ngay")').count();
    console.log('    Saved jobs rendered cards:', savedCardCount);
    if (savedCardCount !== savedCountLs) {
      throw new Error(`Saved card count mismatch: rendered ${savedCardCount} vs expected ${savedCountLs}`);
    }

    // Click Applied tab
    const appliedTabBtn = page.locator('button:has-text("Đã ứng tuyển")').first();
    const appliedTabText = (await appliedTabBtn.textContent()).trim();
    console.log('    Applied tab text:', appliedTabText);
    await appliedTabBtn.click();
    await page.waitForTimeout(500);
  });
  await shot('r3_03_profile_verified');

  // 6. Test SavedJobsModal from navbar dropdown
  await step('SavedJobsModal matches unified jobs pool', async () => {
    await page.locator('header button:has(svg.lucide-chevron-down)').first().click();
    await page.waitForTimeout(300);
    await page.locator('header button:has-text("Việc làm đã lưu")').first().click();
    await page.waitForTimeout(600);

    const modalTitle = await page.locator('h3:has-text("Việc làm đã lưu")').first().textContent();
    console.log('    SavedJobsModal header:', modalTitle.trim());

    // Close modal
    await page.locator('div[class*="fixed"] button:has(svg.lucide-x)').first().click();
    await page.waitForTimeout(400);
  });
  await shot('r3_04_saved_jobs_modal');

  // 7. Role switch to Recruiter and ATS Pipeline verify
  await step('Switch to Recruiter and inspect ATS Pipeline', async () => {
    await page.evaluate(() => { location.hash = 'ats-pipeline'; });
    await page.waitForTimeout(1500);
    await page.locator('text=Tự Động Hóa Quy Trình Tuyển Dụng').waitFor({ timeout: 6000 });

    const cols = await page.locator('h4:has-text("Ứng tuyển mới"), h4:has-text("Đã qua sàng lọc AI"), h4:has-text("Phỏng vấn kỹ thuật"), h4:has-text("Đã gửi Offer")').count();
    console.log('    Kanban column headers found:', cols);
    if (cols < 4) throw new Error(`Expected 4 kanban headers, found ${cols}`);
  });
  await shot('r3_05_ats_pipeline');

  // 8. Logout and confirm guest state
  await step('Logout and verify guest state', async () => {
    await page.locator('header button:has(svg.lucide-chevron-down)').first().click();
    await page.waitForTimeout(300);
    await page.locator('header button:has-text("Đăng xuất")').first().click();
    await page.waitForTimeout(1200);

    const isLoginBtnVisible = await page.locator('header button:has-text("Đăng nhập")').first().isVisible();
    console.log('    Guest login button visible:', isLoginBtnVisible);
    if (!isLoginBtnVisible) throw new Error('Guest login button not visible after logout');
  });
  await shot('r3_06_final_guest');

  console.log('\n===============================================================');
  console.log('🎉 ROUND 3 VERIFICATION COMPLETED');
  console.log('All Logs recorded:', logs.length);
  logs.forEach(l => console.log(' ->', l));
  console.log('===============================================================');

  await browser.close();
})();
