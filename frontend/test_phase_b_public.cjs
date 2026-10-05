// Phase B E2E: real routing, public pages, real login, role-based navbar. Requires Vite (5173) + Spring Boot (8080).
const { chromium } = require('playwright');
const fs = require('fs');

const BASE = 'http://localhost:5173';
const SHOTS = 'shots/phase_b';
fs.mkdirSync(SHOTS, { recursive: true });

let failures = 0;
const check = (cond, msg) => {
  console.log(`${cond ? 'PASS' : 'FAIL'} - ${msg}`);
  if (!cond) failures++;
};

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
  page.on('pageerror', (e) => consoleErrors.push(e.message));

  // 1. Home
  await page.goto(BASE + '/');
  await page.waitForSelector('[data-testid="job-card"]');
  const h1 = await page.textContent('h1');
  check(/^\d+ việc làm IT đang tuyển$/.test(h1.trim()), `home h1 shows real count: "${h1.trim()}"`);
  const body = await page.textContent('body');
  check(!/Backend API/i.test(body), 'no backend debug pill');
  check(!/\bAI\b/.test(await page.textContent('main > section:first-child')), 'no "AI" wording in home hero');
  check((await page.locator('[data-testid="job-card"]').count()) === 6, 'home shows 6 latest jobs');
  check(!/Khớp \d+%/.test(body), 'guest sees no match % badges');
  await page.screenshot({ path: `${SHOTS}/01_home.png`, fullPage: true });

  // 2. Search from home -> URL query
  await page.fill('input[aria-label="Từ khóa"]', 'React');
  await page.click('button:has-text("Tìm kiếm")');
  await page.waitForURL(/\/jobs\?q=React/);
  await page.waitForSelector('[data-testid="result-count"]:has-text("cho \\"React\\"")');
  const countText = await page.textContent('[data-testid="result-count"]');
  check(/^\d+ việc làm cho "React"$/.test(countText.trim()), `search result header: "${countText.trim()}"`);
  const cards = await page.locator('[data-testid="job-card"]').allTextContents();
  check(cards.length > 0 && cards.every((t) => /react|next/i.test(t)), `all ${cards.length} results relate to React`);
  await page.screenshot({ path: `${SHOTS}/02_search_react.png`, fullPage: true });

  // 3. Filter synced to URL + back button
  await page.selectOption('select[aria-label="Cấp bậc"]', 'JUNIOR');
  await page.waitForURL(/level=JUNIOR/);
  check(page.url().includes('q=React') && page.url().includes('level=JUNIOR'), 'level filter added to URL, keyword kept');
  await page.goBack();
  await page.waitForURL((u) => !u.href.includes('level='));
  check(true, 'browser back removes filter');

  // 4. Skill search (backend now matches job skills)
  await page.goto(BASE + '/jobs?q=Kubernetes');
  await page.waitForSelector('[data-testid="result-count"]:has-text("cho")');
  check(!(await page.textContent('[data-testid="result-count"]')).startsWith('0 '), 'skill keyword search returns results');

  // 5. Job detail as guest -> apply redirects to login
  await page.goto(BASE + '/jobs');
  await page.waitForSelector('[data-testid="job-card"]');
  await page.locator('[data-testid="job-card"]').first().click();
  await page.waitForURL(/\/jobs\/\d+$/);
  const jobPath = new URL(page.url()).pathname;
  await page.waitForSelector('[data-testid="apply-button"]');
  check(await page.isVisible('h2:has-text("Mô tả công việc")'), 'job detail shows description section');
  await page.screenshot({ path: `${SHOTS}/03_job_detail_guest.png`, fullPage: true });
  await page.click('[data-testid="apply-button"]');
  await page.waitForURL(/\/login\?next=/);
  check(decodeURIComponent(page.url()).includes(`next=${jobPath}`), 'guest apply redirects to login with next');

  // 6. Wrong password shows backend error
  await page.fill('#email', 'nguyenvanan.it@gmail.com');
  await page.fill('#password', 'wrong-password');
  await page.click('button[type="submit"]');
  await page.waitForSelector('.bg-red-50');
  check(true, `wrong password error: "${(await page.textContent('.bg-red-50')).trim()}"`);

  // 7. Real login -> back to job
  await page.fill('#password', 'Password@123');
  await page.click('button[type="submit"]');
  await page.waitForURL(BASE + jobPath);
  await page.waitForSelector('[data-testid="account-menu"]');
  check((await page.textContent('[data-testid="account-menu"]')).includes('Nguyễn Văn An'), 'navbar shows logged-in candidate');
  check(await page.isVisible('nav a:has-text("Việc làm")'), 'candidate navbar has job-seeker links');
  check(await page.isVisible('[data-testid="notification-bell"]'), 'notification bell visible');
  await page.screenshot({ path: `${SHOTS}/04_job_detail_candidate.png`, fullPage: true });

  // 8. Match % only from backend, shown on list for candidate
  await page.goto(BASE + '/jobs?q=.NET');
  await page.waitForSelector('[data-testid="job-card"]');
  await page.waitForTimeout(800);
  const matchBadges = await page.locator('[data-testid="job-card"] >> text=/Khớp \\d+% kỹ năng/').count();
  check(matchBadges > 0, `candidate sees ${matchBadges} real match badges on .NET jobs`);

  // 9. Save a job (per-user localStorage)
  const firstCard = page.locator('[data-testid="job-card"]').first();
  const saveBtn = firstCard.locator('button[aria-label="Lưu việc làm"], button[aria-label="Bỏ lưu việc làm"]');
  const before = await saveBtn.getAttribute('aria-pressed');
  await saveBtn.click();
  check((await saveBtn.getAttribute('aria-pressed')) !== before, 'save toggle flips state');
  await saveBtn.click();

  // 10. Notifications dropdown opens
  await page.click('[data-testid="notification-bell"]');
  await page.waitForSelector('text=Thông báo');
  await page.screenshot({ path: `${SHOTS}/05_notifications.png` });
  await page.keyboard.press('Escape');
  await page.mouse.click(10, 500);

  // 11. Companies
  await page.goto(BASE + '/companies');
  await page.waitForSelector('a[href^="/companies/"]');
  await page.locator('a[href^="/companies/"]').first().click();
  await page.waitForURL(/\/companies\/\d+$/);
  await page.waitForSelector('h2:has-text("việc làm đang tuyển")');
  check(true, `company page: ${(await page.textContent('h1')).trim()}`);
  await page.screenshot({ path: `${SHOTS}/06_company.png`, fullPage: true });

  // 12. Tools hub
  await page.goto(BASE + '/tools');
  await page.waitForURL(/\/tools\/salary$/);
  check(!!(await page.waitForSelector('h1:has-text("Công cụ nghề nghiệp")')), 'tools hub renders salary tool');
  await page.screenshot({ path: `${SHOTS}/07_tools.png`, fullPage: true });

  // 13. 404
  await page.goto(BASE + '/khong-ton-tai');
  check(await page.isVisible('text=404'), '404 page for unknown route');
  await page.goto(BASE + '/jobs/999999');
  await page.waitForSelector('text=Tin tuyển dụng không tồn tại');
  check(true, 'unknown job id shows not-found message');

  // 14. Logout
  await page.goto(BASE + '/');
  await page.click('[data-testid="account-menu"]');
  await page.click('button:has-text("Đăng xuất")');
  await page.waitForSelector('a:has-text("Đăng nhập")');
  check(true, 'logout returns to guest navbar');

  // 15. Recruiter navbar is different
  await page.goto(BASE + '/login');
  await page.fill('#email', 'recruiter.vng@vng.com.vn');
  await page.fill('#password', 'Password@123');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/employer/);
  await page.waitForSelector('[data-testid="account-menu"]');
  check(await page.isVisible('nav a:has-text("Ứng viên")'), 'recruiter navbar has "Ứng viên"');
  check(!(await page.isVisible('nav a:has-text("Công cụ")')), 'recruiter navbar has no job-seeker tools link');
  await page.click('[data-testid="account-menu"]');
  await page.click('button:has-text("Đăng xuất")');
  await page.waitForSelector('a:has-text("Đăng nhập")');

  // 16. Register page role toggle
  await page.goto(BASE + '/register?role=recruiter');
  await page.waitForSelector('#company option:nth-child(3)', { state: 'attached' });
  check(await page.isVisible('#company'), 'recruiter registration asks for company');
  await page.selectOption('#company', 'new');
  check(await page.isVisible('input[aria-label="Tên công ty"]'), 'new company name input appears');
  await page.click('button:has-text("Tôi tìm việc")');
  check(!(await page.isVisible('#company')), 'candidate registration hides company');

  // 17. Mobile layout
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const m = await mobile.newPage();
  m.on('console', (msg) => msg.type() === 'error' && consoleErrors.push('[mobile] ' + msg.text()));
  await m.goto(BASE + '/');
  await m.waitForSelector('[data-testid="job-card"]');
  await m.click('button[aria-label="Mở menu"]');
  check((await m.locator('a:has-text("Công ty"):visible').count()) > 0, 'mobile menu opens');
  await m.screenshot({ path: `${SHOTS}/08_mobile_home.png`, fullPage: false });

  const relevantErrors = consoleErrors.filter((e) => !/401|Failed to load resource: the server responded with a status of 40[0-4]/.test(e));
  check(relevantErrors.length === 0, `no console errors (${relevantErrors.length}) ${relevantErrors.slice(0, 3).join(' | ')}`);

  await browser.close();
  console.log(failures ? `\n${failures} CHECK(S) FAILED` : '\nALL CHECKS PASSED');
  process.exit(failures ? 1 : 0);
})().catch((e) => {
  console.error('TEST CRASHED:', e);
  process.exit(1);
});
