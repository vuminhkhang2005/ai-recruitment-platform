// Phase D E2E: employer area (dashboard, post/edit job with validation, applicants pipeline, CV view,
// stage changes + rejection reason visible to candidate, notifications, pause/close/delete, role guards).
const { chromium, request } = require('playwright');
const fs = require('fs');

const BASE = 'http://localhost:5173';
const API = 'http://localhost:8080/api/v1';
const SHOTS = 'shots/phase_d';
const CANDIDATE = 'nguyenvanan.it@gmail.com';
const RECRUITER = 'recruiter.vng@vng.com.vn';
fs.mkdirSync(SHOTS, { recursive: true });

let failures = 0;
const check = (cond, msg) => {
  console.log(`${cond ? 'PASS' : 'FAIL'} - ${msg}`);
  if (!cond) failures++;
};

const PDF = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n',
);

async function login(page, email) {
  await page.goto(BASE + '/login');
  await page.fill('#email', email);
  await page.fill('#password', 'Password@123');
  await page.click('button[type="submit"]');
  await page.waitForSelector('[data-testid="account-menu"]');
}

async function logout(page) {
  await page.click('[data-testid="account-menu"]');
  await page.click('button:has-text("Đăng xuất")');
  await page.waitForSelector('a:has-text("Đăng nhập")');
}

(async () => {
  const api = await request.newContext();
  const tokenOf = async (email) =>
    (await (await api.post(`${API}/auth/login`, { data: { email, password: 'Password@123' } })).json()).data.accessToken;
  const candToken = await tokenOf(CANDIDATE);
  const recToken = await tokenOf(RECRUITER);
  const CH = { Authorization: `Bearer ${candToken}` };
  const RH = { Authorization: `Bearer ${recToken}` };

  // Pre-clean leftovers from an interrupted run.
  for (const j of (await (await api.get(`${API}/jobs/mine`, { headers: RH })).json()).data) {
    if (j.title.startsWith('QA Phase D')) await api.delete(`${API}/jobs/${j.id}`, { headers: RH });
  }
  for (const cv of (await (await api.get(`${API}/candidates/me/cvs`, { headers: CH })).json()).data) {
    if (cv.title === 'CV_PhaseD') await api.delete(`${API}/candidates/me/cvs/${cv.id}`, { headers: CH });
  }
  // Candidate uploads a real PDF CV (used later when applying).
  const cvRes = await api.post(`${API}/candidates/me/cvs`, {
    headers: CH,
    multipart: { file: { name: 'CV_PhaseD.pdf', mimeType: 'application/pdf', buffer: PDF } },
  });
  check(cvRes.ok(), `candidate CV uploaded via API (${cvRes.status()})`);
  const unreadBefore = (await (await api.get(`${API}/notifications/unread-count`, { headers: CH })).json()).data.count;

  // Backend validation (API level)
  const bad = await api.post(`${API}/jobs`, {
    headers: RH,
    data: { title: 'QA Phase D invalid', description: 'x', requirements: 'x', minSalary: 50000000, maxSalary: 10000000, skills: ['Java'], deadline: '2099-01-01T23:59:59' },
  });
  check(bad.status() === 400, `backend rejects min > max salary (${bad.status()})`);
  const past = await api.post(`${API}/jobs`, {
    headers: RH,
    data: { title: 'QA Phase D invalid', description: 'x', requirements: 'x', minSalary: 10000000, maxSalary: 20000000, skills: ['Java'], deadline: '2020-01-01T23:59:59' },
  });
  check(past.status() === 400, `backend rejects a past deadline (${past.status()})`);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
  page.on('pageerror', (e) => consoleErrors.push(e.message));
  page.on('dialog', (d) => d.accept());

  // Guard: guest -> login
  await page.goto(BASE + '/employer');
  await page.waitForURL(/\/login\?next=%2Femployer/);
  check(true, 'guest visiting /employer is sent to login');

  // 1. Recruiter dashboard
  await login(page, RECRUITER);
  await page.goto(BASE + '/employer');
  await page.waitForSelector('[data-testid="my-jobs"]');
  const rowsBefore = await page.locator('[data-testid="my-job-row"]').count();
  check(rowsBefore >= 1, `dashboard lists ${rowsBefore} job(s) of the company`);
  check(await page.isVisible('text=VNG'), 'dashboard shows the company name');
  await page.screenshot({ path: `${SHOTS}/01_dashboard.png`, fullPage: true });

  // 2. Create job with client validation
  const title = `QA Phase D Engineer ${Date.now()}`;
  await page.click('a:has-text("Đăng tin mới")');
  await page.waitForURL(/\/employer\/jobs\/new$/);
  await page.fill('#title', title);
  await page.fill('#description', 'Phát triển dịch vụ backend\nViết unit test');
  await page.fill('#requirements', '2 năm kinh nghiệm Java\nBiết Spring Boot');
  await page.fill('#minSalary', '40');
  await page.fill('input[aria-label="Lương tối đa"]', '20');
  await page.click('button:has-text("Đăng tin")');
  await page.waitForSelector('text=Thêm ít nhất một kỹ năng');
  check(true, 'missing skills blocked on the client');
  await page.fill('#skill-input', 'Java, Spring Boot');
  await page.press('#skill-input', 'Enter');
  check((await page.locator('[data-testid="job-skills"] > span').count()) === 2, 'two skills added from comma-separated input');
  await page.click('button:has-text("Đăng tin")');
  await page.waitForSelector('text=Lương tối thiểu không được lớn hơn lương tối đa.');
  check(true, 'min > max salary blocked on the client');
  await page.fill('input[aria-label="Lương tối đa"]', '60');
  await page.screenshot({ path: `${SHOTS}/02_job_form.png`, fullPage: true });
  await page.click('button:has-text("Đăng tin")');
  await page.waitForURL(/\/employer$/);
  await page.waitForSelector(`[data-testid="my-job-row"] >> text=${title}`);
  check((await page.locator('[data-testid="my-job-row"]').count()) === rowsBefore + 1, 'new job appears in the dashboard');
  const myJobs = (await (await api.get(`${API}/jobs/mine`, { headers: RH })).json()).data;
  const job = myJobs.find((j) => j.title === title);
  check(!!job && job.status === 'PUBLISHED' && job.minSalary === 40000000 && job.maxSalary === 60000000, 'job stored as PUBLISHED with salary 40–60 triệu');

  // 3. Edit
  const row = page.locator('[data-testid="my-job-row"]', { hasText: title });
  await row.locator('a:has-text("Sửa")').click();
  await page.waitForURL(new RegExp(`/employer/jobs/${job.id}/edit$`));
  await page.waitForSelector('#title');
  check((await page.inputValue('#minSalary')) === '40', 'edit form pre-filled with existing salary');
  await page.fill('#skill-input', 'Docker');
  await page.press('#skill-input', 'Enter');
  await page.fill('#benefits', 'Lương tháng 13\nBảo hiểm đầy đủ');
  await page.click('button:has-text("Lưu thay đổi")');
  await page.waitForURL(/\/employer$/);
  const edited = (await (await api.get(`${API}/jobs/mine`, { headers: RH })).json()).data.find((j) => j.id === job.id);
  check(edited.skills.includes('Docker') && (edited.benefits || '').includes('Lương tháng 13'), 'edit saved skills and benefits');

  // Public job page shows the new job
  await page.goto(`${BASE}/jobs?keyword=${encodeURIComponent('QA Phase D')}`);
  await page.waitForSelector(`text=${title}`);
  check(true, 'new job is searchable on the public job list');

  // 4. Candidate applies through the UI with the uploaded CV
  await logout(page);
  await login(page, CANDIDATE);
  await page.goto(`${BASE}/jobs/${job.id}`);
  await page.click('[data-testid="apply-button"]');
  await page.waitForSelector('role=dialog');
  await page.locator('role=dialog >> label', { hasText: 'CV_PhaseD' }).locator('input[type="radio"]').check();
  await page.fill('#cover', 'Em có 3 năm kinh nghiệm Java/Spring Boot. (Phase D test)');
  await page.click('role=dialog >> button:has-text("Nộp hồ sơ")');
  await page.waitForSelector('text=Đã nộp hồ sơ vào vị trí');
  check(true, 'candidate applied to the new job');

  // 5. Recruiter processes the application
  await logout(page);
  await login(page, RECRUITER);
  await page.goto(BASE + '/employer');
  const freshRow = page.locator('[data-testid="my-job-row"]', { hasText: title });
  await freshRow.waitFor();
  check((await freshRow.textContent()).includes('1 mới'), 'dashboard shows "1 mới" for the job');
  await freshRow.locator('a:has-text("Ứng viên")').click();
  await page.waitForURL(new RegExp(`/employer/applicants\\?job=${job.id}$`));
  await page.waitForSelector('[data-testid="applicant-item"]');
  check((await page.locator('[data-testid="applicant-item"]').count()) === 1, 'applicants filtered to the job show exactly 1 candidate');
  await page.click('[data-testid="applicant-item"]');
  const panel = page.locator('[data-testid="candidate-panel"]');
  await panel.waitFor();
  check((await panel.textContent()).includes('Phase D test'), 'panel shows the cover letter');
  check(/Khớp \d+%/.test(await panel.textContent()), 'panel shows a real skill match %');
  const [fileRes, popup] = await Promise.all([
    page.waitForResponse((r) => /\/cvs\/\d+\/file$/.test(r.url())),
    ctx.waitForEvent('page'),
    panel.locator('[data-testid="view-cv"]').click(),
  ]);
  check(fileRes.status() === 200 && (fileRes.headers()['content-type'] || '').includes('pdf'), `recruiter can open the candidate's PDF (${fileRes.status()})`);
  await popup.close().catch(() => undefined);

  await panel.locator('[data-testid="next-stage"]').click();
  await page.waitForSelector('text=Ứng viên đã được thông báo');
  check((await panel.textContent()).includes('Mời phỏng vấn'), 'stage moved to screening; next action is "Mời phỏng vấn"');
  await page.screenshot({ path: `${SHOTS}/03_applicants.png`, fullPage: true });
  await panel.locator('button:has-text("Từ chối")').click();
  check(await panel.locator('button:has-text("Xác nhận từ chối")').isDisabled(), 'reject requires a reason');
  const reason = 'Vị trí cần kinh nghiệm Kafka nhiều hơn. (Phase D test)';
  await page.fill('#reject-reason', reason);
  await panel.locator('button:has-text("Xác nhận từ chối")').click();
  await panel.locator(`text=${reason}`).waitFor();
  check((await panel.locator('[data-testid="next-stage"]').count()) === 0, 'no further actions after rejection');

  // 6. Candidate sees the outcome and the notifications
  await logout(page);
  await login(page, CANDIDATE);
  const bell = page.locator('[data-testid="notification-bell"]');
  await page.waitForFunction(() => /chưa đọc/.test(document.querySelector('[data-testid="notification-bell"]')?.getAttribute('aria-label') || ''));
  const unreadNow = Number(((await bell.getAttribute('aria-label')).match(/\((\d+)/) || [])[1] || 0);
  check(unreadNow >= unreadBefore + 2, `bell shows new unread notifications (${unreadBefore} → ${unreadNow})`);
  await bell.click();
  await page.waitForSelector(`text=${title}`);
  await page.screenshot({ path: `${SHOTS}/04_candidate_bell.png` });
  await page.keyboard.press('Escape');
  await page.goto(BASE + '/applications');
  const appRow = page.locator('[data-testid="application-row"]', { hasText: title });
  await appRow.waitFor();
  const appText = await appRow.textContent();
  check(appText.includes('Chưa phù hợp'), 'candidate sees the rejected stage ("Chưa phù hợp")');
  check(appText.includes(reason), 'candidate sees the rejection reason');
  check((await appRow.locator('button:has-text("Rút hồ sơ")').count()) === 0, 'rejected application cannot be withdrawn');

  // Candidate cannot open employer pages
  await page.goto(BASE + '/employer');
  await page.waitForURL(/\/employers$/);
  check(true, 'candidate visiting /employer is redirected to /employers');

  // 7. Pause / reopen / close / delete
  await logout(page);
  await login(page, RECRUITER);
  await page.goto(BASE + '/employer');
  const jr = () => page.locator('[data-testid="my-job-row"]', { hasText: title });
  await jr().waitFor();
  await jr().locator('button:has-text("Tạm dừng")').click();
  await jr().locator('text=Tạm dừng').first().waitFor();
  await jr().locator('button:has-text("Mở lại")').waitFor();
  const pausedPublic = await api.get(`${API}/jobs?keyword=${encodeURIComponent(title)}`);
  check(!(await pausedPublic.json()).data.items.some((j) => j.id === job.id), 'paused job hidden from public search');
  await jr().locator('button:has-text("Mở lại")').click();
  await jr().locator('button:has-text("Đóng tin")').waitFor();
  check(true, 'paused job can be reopened');
  await jr().locator('button:has-text("Đóng tin")').click();
  await jr().locator('button:has-text("Mở lại")').waitFor();
  check((await jr().textContent()).includes('Đã đóng'), 'job closed');
  const applyClosed = await api.post(`${API}/applications`, { headers: CH, data: { jobId: job.id, cvId: null, coverLetter: '' } });
  check(applyClosed.status() >= 400, `applying to a closed job is refused (${applyClosed.status()})`);
  await page.screenshot({ path: `${SHOTS}/05_closed.png`, fullPage: true });
  await jr().locator('button:has-text("Xóa")').click();
  await page.waitForSelector('text=Đã xóa tin tuyển dụng');
  await page.waitForTimeout(500);
  check((await jr().count()) === 0, 'deleted job removed from the dashboard');

  // Recruiter cannot open candidate pages
  await page.goto(BASE + '/saved-jobs');
  await page.waitForURL(/\/employer$/);
  check(true, 'recruiter visiting /saved-jobs is redirected to /employer');

  // Mobile layout sanity
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/employer/applicants');
  await page.waitForSelector('h1:has-text("Ứng viên")');
  await page.screenshot({ path: `${SHOTS}/06_mobile_applicants.png`, fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(overflow <= 1, `no horizontal page overflow on mobile applicants (${overflow}px)`);
  for (const p of ['/employer', '/employer/jobs/new']) {
    await page.goto(BASE + p);
    await page.waitForSelector('h1');
    const o = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(o <= 1, `no horizontal page overflow on mobile ${p} (${o}px)`);
  }

  const relevant = consoleErrors.filter((e) => !/status of 40[0-4]/.test(e));
  check(relevant.length === 0, `no console errors (${relevant.length}) ${relevant.slice(0, 3).join(' | ')}`);
  await browser.close();
  console.log(`\nTEST JOB ID: ${job.id}`);
  console.log(failures ? `\n${failures} CHECK(S) FAILED` : '\nALL CHECKS PASSED');
  process.exit(failures ? 1 : 0);
})().catch((e) => {
  console.error('TEST CRASHED:', e);
  process.exit(1);
});
