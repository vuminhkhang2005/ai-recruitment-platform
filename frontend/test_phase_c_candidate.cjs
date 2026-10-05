// Phase C E2E: candidate area (CV manager, skills, profile, apply, applications timeline, withdraw, saved jobs, guards).
const { chromium, request } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');

const BASE = 'http://localhost:5173';
const API = 'http://localhost:8080/api/v1';
const SHOTS = 'shots/phase_c';
fs.mkdirSync(SHOTS, { recursive: true });

let failures = 0;
const check = (cond, msg) => {
  console.log(`${cond ? 'PASS' : 'FAIL'} - ${msg}`);
  if (!cond) failures++;
};

const pdfPath = path.join(os.tmpdir(), 'CV_Test_PhaseC.pdf');
fs.writeFileSync(
  pdfPath,
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n',
);
const txtPath = path.join(os.tmpdir(), 'not_a_cv.txt');
fs.writeFileSync(txtPath, 'hello');

async function login(page, email) {
  await page.goto(BASE + '/login');
  await page.fill('#email', email);
  await page.fill('#password', 'Password@123');
  await page.click('button[type="submit"]');
  await page.waitForSelector('[data-testid="account-menu"]');
}

(async () => {
  // Pick an open job the candidate has not applied to, using the API directly.
  const api = await request.newContext();
  const auth = await (await api.post(`${API}/auth/login`, { data: { email: 'nguyenvanan.it@gmail.com', password: 'Password@123' } })).json();
  const token = auth.data.accessToken;
  const mine = (await (await api.get(`${API}/applications/me`, { headers: { Authorization: `Bearer ${token}` } })).json()).data;
  const applied = new Set(mine.map((a) => a.jobId));
  const jobs = (await (await api.get(`${API}/jobs?size=50`)).json()).data.items;
  const target = jobs.find((j) => !applied.has(j.id));
  check(!!target, `found an open job not yet applied: #${target && target.id} ${target && target.title}`);
  // Pre-clean leftovers from an interrupted previous run.
  const H = { Authorization: `Bearer ${token}` };
  for (const cv of (await (await api.get(`${API}/candidates/me/cvs`, { headers: H })).json()).data) {
    if (cv.title === 'CV_Test_PhaseC') await api.delete(`${API}/candidates/me/cvs/${cv.id}`, { headers: H });
  }
  const pre = (await (await api.get(`${API}/candidates/me/skills`, { headers: H })).json()).data;
  if (pre.some((s) => s.name === 'Kubernetes')) {
    await api.put(`${API}/candidates/me/skills`, { headers: H, data: { skills: pre.filter((s) => s.name !== 'Kubernetes') } });
  }
  const preProfile = (await (await api.get(`${API}/users/me`, { headers: H })).json()).data;
  if ((preProfile.headline || '').endsWith(' - test')) {
    await api.put(`${API}/users/me`, { headers: H, data: { headline: preProfile.headline.replace(' - test', '') } });
  }
  const originalProfile = (await (await api.get(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } })).json()).data;
  const originalSkills = (await (await api.get(`${API}/candidates/me/skills`, { headers: { Authorization: `Bearer ${token}` } })).json()).data;

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
  page.on('pageerror', (e) => consoleErrors.push(e.message));
  page.on('dialog', (d) => d.accept());

  // Guard: guest -> login
  await page.goto(BASE + '/applications');
  await page.waitForURL(/\/login\?next=%2Fapplications/);
  check(true, 'guest visiting /applications is sent to login');

  await login(page, 'nguyenvanan.it@gmail.com');

  // 1. Profile page
  await page.goto(BASE + '/profile');
  await page.waitForSelector('[data-testid="cv-list"]');
  const cvCountBefore = await page.locator('[data-testid="cv-list"] > li').count();
  check(cvCountBefore >= 1, `CV list shows ${cvCountBefore} CV(s)`);
  check(await page.isVisible('text=Không có file'), 'seeded CVs without a real file are labelled honestly');

  // invalid file
  await page.setInputFiles('[data-testid="cv-upload-input"]', txtPath);
  await page.waitForSelector('text=Chỉ nhận file PDF, DOC hoặc DOCX.');
  check(true, 'non-CV file rejected on the client');

  // upload real PDF
  await page.setInputFiles('[data-testid="cv-upload-input"]', pdfPath);
  await page.waitForSelector('[data-testid="cv-list"] >> text=CV_Test_PhaseC.pdf');
  check((await page.locator('[data-testid="cv-list"] > li').count()) === cvCountBefore + 1, 'uploaded CV appears in list');
  const newCvRow = page.locator('[data-testid="cv-list"] > li', { hasText: 'CV_Test_PhaseC.pdf' });
  const [fileRes, popup] = await Promise.all([
    page.waitForResponse((r) => /\/cvs\/\d+\/file$/.test(r.url())),
    ctx.waitForEvent('page'),
    newCvRow.locator('button:has-text("Xem")').click(),
  ]);
  check(fileRes.status() === 200 && (fileRes.headers()['content-type'] || '').includes('pdf'), `"Xem" fetches the uploaded PDF through the authenticated endpoint (${fileRes.status()})`);
  await popup.close().catch(() => undefined);

  // 2. Skills
  await page.fill('#skill-name', 'Kubernetes');
  await page.fill('#skill-years', '2');
  await page.click('form:has(#skill-name) button:has-text("Thêm")');
  await page.click('button:has-text("Lưu kỹ năng")');
  await page.waitForSelector('text=Đã lưu kỹ năng');
  check(await page.isVisible('[data-testid="skill-list"] >> text=Kubernetes'), 'skill added and saved');
  await page.fill('#skill-name', 'kubernetes');
  await page.click('form:has(#skill-name) button:has-text("Thêm")');
  check(await page.isVisible('text=đã có trong danh sách'), 'duplicate skill rejected');

  // 3. Profile info
  await page.fill('#p-headline', 'Backend Developer (.NET) - test');
  await page.click('button:has-text("Lưu thông tin")');
  await page.waitForSelector('text=Đã lưu thông tin');
  await page.reload();
  await page.waitForSelector('#p-headline');
  check((await page.inputValue('#p-headline')) === 'Backend Developer (.NET) - test', 'profile headline persisted after reload');
  await page.screenshot({ path: `${SHOTS}/01_profile.png`, fullPage: true });

  // 4. Apply with the uploaded CV
  await page.goto(`${BASE}/jobs/${target.id}`);
  await page.click('[data-testid="apply-button"]');
  await page.waitForSelector('role=dialog');
  await page.locator('role=dialog >> label', { hasText: 'CV_Test_PhaseC' }).locator('input[type="radio"]').check();
  await page.fill('#cover', 'Em xin ứng tuyển vị trí này. (Phase C test)');
  await page.screenshot({ path: `${SHOTS}/02_apply_modal.png` });
  await page.click('role=dialog >> button:has-text("Nộp hồ sơ")');
  await page.waitForSelector('text=Đã nộp hồ sơ vào vị trí');
  await page.waitForSelector('a:has-text("Đã ứng tuyển · Xem trạng thái")');
  check(true, 'apply succeeded and button switched to "Đã ứng tuyển"');

  // 5. Applications page
  await page.click('a:has-text("Đã ứng tuyển · Xem trạng thái")');
  await page.waitForURL(/\/applications$/);
  const row = page.locator('[data-testid="application-row"]', { hasText: target.title }).first();
  await row.waitFor();
  check((await row.textContent()).includes('Đã nộp'), 'new application shows stage "Đã nộp"');
  check((await row.textContent()).includes('CV: CV_Test_PhaseC'), 'application references the chosen CV');
  await row.locator('button:has-text("Lịch sử hồ sơ")').click();
  check(await row.locator('[data-testid="application-timeline"]').isVisible(), 'timeline expands');
  await page.screenshot({ path: `${SHOTS}/03_applications.png`, fullPage: true });
  const rowsBefore = await page.locator('[data-testid="application-row"]').count();
  await row.locator('button:has-text("Rút hồ sơ")').click();
  await page.waitForSelector('text=Đã rút hồ sơ');
  await page.waitForTimeout(500);
  check((await page.locator('[data-testid="application-row"]').count()) === rowsBefore - 1, 'withdraw removes the application');

  // A processed application cannot be withdrawn
  const processed = mine.find((a) => !['APPLIED', 'SCREENING'].includes(a.currentStage));
  if (processed) {
    const prow = page.locator('[data-testid="application-row"]', { hasText: processed.jobTitle }).first();
    check((await prow.locator('button:has-text("Rút hồ sơ")').count()) === 0, `no withdraw button at stage ${processed.currentStage}`);
  }

  // 6. Saved jobs
  await page.goto(`${BASE}/jobs/${target.id}`);
  await page.click('button[aria-label="Lưu việc làm"]');
  await page.goto(BASE + '/saved-jobs');
  await page.waitForSelector('[data-testid="saved-job"]');
  check((await page.textContent('[data-testid="saved-job"]')).includes(target.title), 'saved job listed on /saved-jobs');
  await page.screenshot({ path: `${SHOTS}/04_saved.png`, fullPage: true });
  await page.click(`button[aria-label="Bỏ lưu ${target.title}"]`);
  await page.waitForSelector('text=Bạn chưa lưu việc làm nào');
  check(true, 'unsave empties the list');

  // 7. Cleanup via UI: delete test CV
  await page.goto(BASE + '/profile');
  await page.waitForSelector('[data-testid="cv-list"]');
  await page.click('button[aria-label="Xóa CV CV_Test_PhaseC"]');
  await page.waitForSelector('text=Đã xóa CV');
  check((await page.locator('[data-testid="cv-list"] > li', { hasText: 'CV_Test_PhaseC.pdf' }).count()) === 0, 'test CV deleted');

  // 8. Recruiter cannot open candidate pages
  await page.click('[data-testid="account-menu"]');
  await page.click('button:has-text("Đăng xuất")');
  await page.waitForSelector('a:has-text("Đăng nhập")');
  await login(page, 'recruiter.vng@vng.com.vn');
  await page.goto(BASE + '/applications');
  await page.waitForURL(/\/employer$/);
  check(true, 'recruiter visiting /applications is redirected to /employer');

  // restore demo data
  await api.put(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` }, data: { headline: originalProfile.headline } });
  await api.put(`${API}/candidates/me/skills`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { skills: originalSkills.map((s) => ({ name: s.name, proficiency: s.proficiency, yearsExperience: s.yearsExperience })) },
  });

  const relevant = consoleErrors.filter((e) => !/status of 40[0-4]/.test(e));
  check(relevant.length === 0, `no console errors (${relevant.length}) ${relevant.slice(0, 3).join(' | ')}`);
  await browser.close();
  console.log(failures ? `\n${failures} CHECK(S) FAILED` : '\nALL CHECKS PASSED');
  process.exit(failures ? 1 : 0);
})().catch((e) => {
  console.error('TEST CRASHED:', e);
  process.exit(1);
});
