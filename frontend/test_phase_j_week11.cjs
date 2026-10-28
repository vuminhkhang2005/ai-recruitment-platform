/**
 * Phase J (Week 11) end-to-end verification with Playwright.
 *
 * Covers: OAuth hardening (real Google redirect), job list split view, location-aware AI recommendations,
 * CSV exports (recruiter + admin), company reviews (candidate write/delete + admin hide/re-publish),
 * code-split admin/employer pages, and the bulk stage e-mail composer.
 *
 * Usage (backend on :8080, Vite on :5173):  node test_phase_j_week11.cjs
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:5173';
const SHOTS = process.env.SHOTS_DIR || path.join(__dirname, 'screenshots', 'week11');
const results = [];

function check(name, ok, detail = '') {
  results.push(!!ok);
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? `  -> ${detail}` : ''}`);
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(SHOTS, name), fullPage: false });
}

async function demoLogin(page, role) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.click(`[data-testid="demo-login-${role}"]`);
  await page.waitForFunction(() => !location.pathname.startsWith('/login'), null, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
}

async function logout(context) {
  await context.clearCookies();
  const p = context.pages()[0];
  await p.evaluate(() => localStorage.clear());
}

async function readDownload(download) {
  const file = await download.path();
  const buf = fs.readFileSync(file);
  return { name: download.suggestedFilename(), buf, text: buf.toString('utf8').replace(/^\uFEFF/, '') };
}

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push(e.message));

  try {
    // ------------------------------------------------------------ 1. Google sign-in goes to the real Google page
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    let googleUrl = null;
    await page.route('https://accounts.google.com/**', (route) => {
      googleUrl = route.request().url();
      return route.fulfill({ status: 200, contentType: 'text/html', body: '<html><body>google</body></html>' });
    });
    await page.click('[data-testid="oauth2-google-btn"]');
    await page.waitForTimeout(1500);
    check('Google button redirects to accounts.google.com (no in-app e-mail sandbox)',
      googleUrl && googleUrl.includes('prompt=select_account') && !googleUrl.includes('prompt=consent'),
      googleUrl ? googleUrl.slice(0, 110) + '…' : 'no redirect');
    await page.unroute('https://accounts.google.com/**');

    // ------------------------------------------------------------ 2. Public: companies with ratings, reviews section
    await page.goto(`${BASE}/companies`, { waitUntil: 'networkidle' });
    const ratingChips = await page.locator('[data-testid="company-card-rating"]').count();
    check('Companies page shows star ratings on cards', ratingChips > 0, `${ratingChips} cards with rating`);
    await shot(page, '01_companies_with_ratings.png');

    await page.goto(`${BASE}/companies/2`, { waitUntil: 'networkidle' });
    await page.locator('[data-testid="company-reviews"]').scrollIntoViewIfNeeded();
    await page.waitForSelector('[data-testid="review-item"]', { timeout: 10000 });
    const avg = await page.textContent('[data-testid="review-average"]');
    const signInPrompt = await page.locator('[data-testid="company-reviews"] a[href^="/login"]').count();
    check('Company page lists reviews with average and asks visitors to sign in', avg && signInPrompt > 0, `avg=${avg}`);
    await shot(page, '02_company_reviews_public.png');

    // ------------------------------------------------------------ 3. Candidate
    await demoLogin(page, 'candidate');

    // 3a. Job list split view: plain click keeps /jobs and updates the right panel
    await page.goto(`${BASE}/jobs`, { waitUntil: 'networkidle' });
    const cards = page.locator('[data-testid="job-card"]');
    await cards.nth(1).waitFor({ timeout: 10000 });
    const secondTitle = (await cards.nth(1).locator('h3').textContent()).trim();
    await cards.nth(1).click();
    await page.waitForTimeout(800);
    const url = new URL(page.url());
    const panelText = await page.locator('main').innerText();
    check('Clicking a job card shows the preview on the right without opening the detail page',
      url.pathname === '/jobs' && panelText.includes(secondTitle), `${url.pathname} | ${secondTitle}`);

    // 3b. AI recommendations never recommend onsite jobs in another city
    const recResp = page.waitForResponse((r) => r.url().includes('/ai/recommended-jobs') && r.status() === 200, { timeout: 15000 });
    await page.goto(`${BASE}/jobs?recommended=1`, { waitUntil: 'networkidle' });
    const recJson = await (await recResp).json();
    const otherCity = recJson.data.filter((r) => r.locationStatus === 'OTHER_CITY');
    const recFooter = await page.locator('main').innerText();
    check('AI recommendation panel hides other-city onsite jobs',
      !recFooter.includes('Khác khu vực') && !recFooter.includes('JD tại'),
      `API: ${recJson.data.length} scored, ${otherCity.length} other-city (kept only in the main list), city=${recJson.data[0]?.candidateCity}`);
    await shot(page, '03_ai_recommendations_location.png');

    // 3c. Write a review for a company the candidate applied to (FPT Software = 1), then delete it
    await page.goto(`${BASE}/companies/1#reviews`, { waitUntil: 'networkidle' });
    await page.locator('[data-testid="company-reviews"]').scrollIntoViewIfNeeded();
    if (await page.locator('[data-testid="review-delete"]').count()) {
      page.once('dialog', (d) => d.accept());
      await page.click('[data-testid="review-delete"]');
      await page.waitForTimeout(800);
    }
    await page.waitForSelector('[data-testid="review-form"]', { timeout: 10000 });
    await page.click('[data-testid="review-star-4"]');
    await page.fill('[data-testid="review-title"]', 'E2E: clear and friendly interview process');
    await page.fill('[data-testid="review-pros"]', 'Recruiter replied quickly and the technical questions matched the JD.');
    await page.fill('[data-testid="review-cons"]', 'Waiting time between rounds was a little long.');
    await shot(page, '04_candidate_review_form.png');
    await page.click('[data-testid="review-submit"]');
    await page.waitForSelector('[data-testid="review-edit"]', { timeout: 10000 });
    const listText = await page.locator('[data-testid="company-reviews"]').innerText();
    check('Candidate submits a review and sees it (anonymous by default)',
      listText.includes('E2E: clear and friendly interview process') && (listText.includes('ẩn danh') || listText.includes('Anonymous')));
    await shot(page, '05_candidate_review_posted.png');
    page.once('dialog', (d) => d.accept());
    await page.click('[data-testid="review-delete"]');
    await page.waitForSelector('[data-testid="review-form"]', { timeout: 10000 });
    check('Candidate deletes own review (cleanup)', true);

    // ------------------------------------------------------------ 4. Recruiter
    await logout(context);
    await demoLogin(page, 'recruiter');

    await page.goto(`${BASE}/employer/applicants`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="export-applicants"]', { timeout: 15000 });
    await page.click('[data-testid="export-applicants"] button');
    const [dl1] = await Promise.all([page.waitForEvent('download'), page.click('[data-testid="export-applicants-csv"]')]);
    const csv1 = await readDownload(dl1);
    check('Recruiter downloads applicants CSV (UTF-8 BOM, Vietnamese header)',
      csv1.buf[0] === 0xef && csv1.name.startsWith('talentbridge_applicants') && csv1.text.split('\r\n')[0].includes('Ứng viên'),
      `${csv1.name}, ${csv1.text.split('\r\n').filter(Boolean).length - 1} rows`);

    // Bulk stage composer (opened and previewed, not sent)
    await page.click('[data-testid="select-all-applicants"]');
    await page.waitForSelector('[data-testid="bulk-action-bar"]', { timeout: 5000 });
    await page.click('[data-testid="bulk-invite-btn"]');
    await page.waitForSelector('[data-testid="stage-email-modal"]', { timeout: 5000 });
    const preview = await page.locator('[data-testid="email-live-preview"]').innerText();
    check('Bulk stage e-mail composer opens with a live preview', preview.length > 40);
    await shot(page, '06_recruiter_bulk_composer.png');
    await page.keyboard.press('Escape');
    const cancelBtn = page.locator('[data-testid="stage-email-modal"] button', { hasText: /Huỷ|Hủy|Cancel/ }).first();
    if (await cancelBtn.count()) await cancelBtn.click();

    await page.goto(`${BASE}/employer/analytics`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="export-analytics"]', { timeout: 15000 });
    await page.click('[data-testid="export-analytics"] button');
    const [dl2] = await Promise.all([page.waitForEvent('download'), page.click('[data-testid="export-analytics-csv"]')]);
    const csv2 = await readDownload(dl2);
    check('Recruiter downloads recruitment report CSV (KPIs + funnel)',
      csv2.text.includes('BÁO CÁO TUYỂN DỤNG') && csv2.text.includes('Phễu tuyển dụng'), csv2.name);
    await page.emulateMedia({ media: 'print' });
    await shot(page, '07_analytics_print_preview.png');
    const navHidden = await page.evaluate(() => getComputedStyle(document.querySelector('header')).display === 'none');
    check('Print stylesheet hides navigation for "Save as PDF"', navHidden);
    await page.emulateMedia({ media: 'screen' });

    // ------------------------------------------------------------ 5. Admin
    await logout(context);
    await demoLogin(page, 'admin');

    await page.goto(`${BASE}/admin/users`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="export-admin-users"]', { timeout: 15000 });
    await page.click('[data-testid="export-admin-users"] button');
    const [dl3] = await Promise.all([page.waitForEvent('download'), page.click('[data-testid="export-admin-users-csv"]')]);
    const csv3 = await readDownload(dl3);
    check('Admin downloads users CSV', csv3.name.startsWith('talentbridge_users') && csv3.text.includes('Email'),
      `${csv3.text.split('\r\n').filter(Boolean).length - 1} users`);

    await page.click('[data-testid="admin-tab-reviews"]');
    await page.waitForSelector('[data-testid="admin-reviews-page"]', { timeout: 15000 });
    await page.waitForSelector('[data-testid="admin-review-row"]', { timeout: 10000 });
    const rows = await page.locator('[data-testid="admin-review-row"]').count();
    check('Admin review moderation page is reachable from the admin tabs (lazy-loaded)', rows > 0, `${rows} reviews`);
    await shot(page, '08_admin_reviews_moderation.png');

    const first = page.locator('[data-testid="admin-review-row"]').first();
    await first.locator('[data-testid="admin-review-hide"]').click();
    await page.fill('[data-testid="admin-review-note"]', 'E2E moderation check');
    await page.click('[data-testid="admin-review-confirm-hide"]');
    await first.locator('[data-testid="admin-review-publish"]').waitFor({ timeout: 10000 });
    check('Admin hides a review with a reason', (await first.innerText()).includes('E2E moderation check'));
    await first.locator('[data-testid="admin-review-publish"]').click();
    await first.locator('[data-testid="admin-review-hide"]').waitFor({ timeout: 10000 });
    check('Admin re-publishes the review (restored)', true);

    check('No uncaught page errors during the run', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));
  } catch (e) {
    check('Unexpected error', false, e.message.split('\n')[0]);
    await shot(page, '99_failure.png').catch(() => {});
  } finally {
    await browser.close();
    const passed = results.filter(Boolean).length;
    console.log(`\n${passed}/${results.length} checks passed — screenshots: ${SHOTS}`);
    process.exit(passed === results.length ? 0 : 1);
  }
})();
