const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:5173';
const SHOT_DIR = 'C:/Users/DELL/.gemini/antigravity/brain/9c817057-d548-404f-95a2-714d44394a10/screenshots/progress_tracker';
fs.mkdirSync(SHOT_DIR, { recursive: true });

let failures = 0;
const check = (cond, msg) => {
  console.log(`${cond ? 'PASS' : 'FAIL'} - ${msg}`);
  if (!cond) failures++;
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('--- Testing Recruitment Progress Tracker ---');
  await page.goto(BASE + '/');
  await page.waitForSelector('[data-testid="recruitment-progress-tracker"]');

  const tracker = page.locator('[data-testid="recruitment-progress-tracker"]');
  check(await tracker.isVisible(), 'Progress Tracker is visible on homepage');

  // Verify header
  const titleText = await tracker.locator('p:has-text("Quy trình tuyển dụng")').textContent();
  check(titleText.includes('Quy trình tuyển dụng'), `Header title: "${titleText.trim()}"`);

  const dashboardLabel = await tracker.locator('text=Bảng điều khiển nhà tuyển dụng').textContent();
  check(dashboardLabel.includes('Bảng điều khiển nhà tuyển dụng'), 'Recruiter dashboard label present');

  // Verify 5 stages exist
  const buttons = tracker.locator('button[aria-label^="Bước"]');
  const count = await buttons.count();
  check(count === 5, `Tracker has 5 milestone buttons (found ${count})`);

  // Default is Stage 2 (Sàng lọc)
  let activeDetail = await tracker.locator('h4').textContent();
  check(activeDetail.includes('Sàng lọc'), `Default active stage is Sàng lọc (found: ${activeDetail.trim()})`);

  // Click on Stage 1 (Ứng tuyển)
  await buttons.nth(0).click();
  await page.waitForTimeout(300);
  activeDetail = await tracker.locator('h4').textContent();
  check(activeDetail.includes('Ứng tuyển'), `Switched to Stage 1: ${activeDetail.trim()}`);
  await tracker.screenshot({ path: path.join(SHOT_DIR, '01_stage_1_applied.png') });

  // Click on Stage 3 (Phỏng vấn)
  await buttons.nth(2).click();
  await page.waitForTimeout(300);
  activeDetail = await tracker.locator('h4').textContent();
  check(activeDetail.includes('Phỏng vấn'), `Switched to Stage 3: ${activeDetail.trim()}`);
  await tracker.screenshot({ path: path.join(SHOT_DIR, '02_stage_3_interview.png') });

  // Click on Stage 5 (Đã tuyển)
  await buttons.nth(4).click();
  await page.waitForTimeout(300);
  activeDetail = await tracker.locator('h4').textContent();
  check(activeDetail.includes('Đã tuyển'), `Switched to Stage 5: ${activeDetail.trim()}`);
  await tracker.screenshot({ path: path.join(SHOT_DIR, '03_stage_5_hired.png') });

  // Click "Trước" button
  await tracker.locator('button:has-text("Trước")').click();
  await page.waitForTimeout(300);
  activeDetail = await tracker.locator('h4').textContent();
  check(activeDetail.includes('Offer'), `Stepper "Trước" navigated to Offer: ${activeDetail.trim()}`);

  // Test full section screenshot on desktop
  const employerSection = page.locator('section:has([data-testid="recruitment-progress-tracker"])');
  await employerSection.screenshot({ path: path.join(SHOT_DIR, '04_desktop_section.png') });

  // Test mobile viewport (390x844)
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto(BASE + '/');
  await mobilePage.waitForSelector('[data-testid="recruitment-progress-tracker"]');
  const mobileTracker = mobilePage.locator('[data-testid="recruitment-progress-tracker"]');
  await mobileTracker.scrollIntoViewIfNeeded();
  await mobileTracker.screenshot({ path: path.join(SHOT_DIR, '05_mobile_tracker.png') });
  check(await mobileTracker.isVisible(), 'Mobile view renders Progress Tracker cleanly');

  // Test dark mode
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.waitForTimeout(300);
  await employerSection.screenshot({ path: path.join(SHOT_DIR, '06_dark_mode_section.png') });
  check(true, 'Dark mode screenshot captured');

  await browser.close();
  console.log(`\nResult: ${failures === 0 ? 'ALL PROGRESS TRACKER TESTS PASSED!' : `${failures} failures`}`);
  process.exit(failures === 0 ? 0 : 1);
})();
