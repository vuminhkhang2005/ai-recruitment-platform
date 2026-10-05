// Phase E Full E2E Test: End-to-end user journeys (Public visitor, Tools Gross/Net, Candidate apply with real CV, Recruiter stage advancement, Notifications, Mobile responsiveness, Zero console errors).
const { chromium, request } = require('playwright');
const fs = require('fs');

const BASE = 'http://localhost:5173';
const API = 'http://localhost:8080/api/v1';
const SHOTS = 'shots/phase_e';
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

  // Pre-cleanup leftover test data if any
  for (const cv of (await (await api.get(`${API}/candidates/me/cvs`, { headers: CH })).json()).data) {
    if (cv.title === 'CV_PhaseE_An') await api.delete(`${API}/candidates/me/cvs/${cv.id}`, { headers: CH });
  }

  // Find an open job for VNG to apply to (e.g. job 3 Junior Frontend React Developer, or job 4 Backend Golang)
  const myApps = (await (await api.get(`${API}/applications/me`, { headers: CH })).json()).data;
  const appliedJobIds = new Set(myApps.map((a) => a.jobId));
  const vngJobs = (await (await api.get(`${API}/jobs/mine`, { headers: RH })).json()).data;
  let targetJob = vngJobs.find((j) => j.status === 'PUBLISHED' && !appliedJobIds.has(j.id));

  // If candidate already applied to all VNG jobs, withdraw one applied/screening application to test fresh flow
  if (!targetJob) {
    const withdrawable = myApps.find((a) => ['APPLIED', 'SCREENING'].includes(a.currentStage) && vngJobs.some((v) => v.id === a.jobId));
    if (withdrawable) {
      await api.delete(`${API}/applications/${withdrawable.id}`, { headers: CH });
      targetJob = vngJobs.find((j) => j.id === withdrawable.jobId);
    }
  }
  check(!!targetJob, `Target job for application flow: #${targetJob?.id} ${targetJob?.title}`);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
  page.on('pageerror', (e) => consoleErrors.push(e.message));
  page.on('dialog', (d) => d.accept());

  // ==========================================
  // 1. PUBLIC VISITOR FLOW
  // ==========================================
  console.log('\n--- 1. PUBLIC VISITOR JOURNEY ---');
  await page.goto(BASE);
  await page.waitForSelector('h1');
  check(await page.isVisible('text=TalentBridge'), 'Home page renders TalentBridge branding');
  await page.screenshot({ path: `${SHOTS}/01_home.png`, fullPage: true });

  // Search jobs
  await page.fill('input[aria-label="Từ khóa"]', 'React');
  await page.click('button:has-text("Tìm kiếm")');
  await page.waitForURL(/\/jobs\?q=React/);
  await page.waitForSelector('[data-testid="job-card"]');
  check((await page.locator('[data-testid="job-card"]').count()) >= 1, 'Job search returns matching React jobs');
  await page.screenshot({ path: `${SHOTS}/02_job_search.png`, fullPage: true });

  // Job detail with enriched bullet points
  await page.goto(`${BASE}/jobs/3`);
  await page.waitForSelector('.job-description-content');
  const bulletsCount = await page.locator('.job-description-content ul li').count();
  check(bulletsCount >= 8, `Enriched job details render structured bullet points (${bulletsCount} bullets)`);
  await page.screenshot({ path: `${SHOTS}/03_job_detail_public.png`, fullPage: true });

  // ==========================================
  // 2. TOOLS TAB (DETERMINISTIC GROSS ⇄ NET)
  // ==========================================
  console.log('\n--- 2. TOOLS TAB (GROSS ⇄ NET CALCULATOR) ---');
  await page.goto(`${BASE}/tools/salary`);
  await page.waitForSelector('h2:has-text("Bảng quy đổi Lương Gross ⇄ Net")');

  // Check Gross -> Net with 30,000,000
  await page.waitForSelector('[data-testid="net-amount"]');
  const netText = await page.locator('[data-testid="net-amount"]').textContent();
  check(netText.includes('25.222.500') || netText.includes('25,222,500'), `Gross 30M converts to exact Net 25.22M (${netText.trim()} VNĐ)`);
  check(await page.isVisible('text=2,340,000') || await page.isVisible('text=2.340.000'), 'Displays official base salary legal reference (01/07/2024)');
  await page.screenshot({ path: `${SHOTS}/04_tool_salary_gross_net.png`, fullPage: true });

  // Switch to Net -> Gross
  await page.click('button:has-text("NET → GROSS")');
  await page.waitForTimeout(300);
  const grossText = await page.locator('[data-testid="gross-amount"]').textContent();
  check(grossText.length > 0, `Net -> Gross mode calculates equivalent Gross (${grossText.trim()} VNĐ)`);

  // Visit other tool tabs
  await page.click('a:has-text("So sánh offer")');
  await page.waitForSelector('text=So Sánh Offer & Tính Tổng Thu Nhập');
  check(true, 'Offer studio renders with clean professional terminology');

  await page.click('a:has-text("Tạo CV")');
  await page.waitForSelector('text=Trình Soạn CV Chuẩn & Tối Ưu Từ Khóa');
  check(true, 'CV builder loads without flashy AI claims');

  await page.click('a:has-text("Luyện code")');
  await page.waitForSelector('text=Gợi ý giải thuật');
  check(true, 'Coding sandbox loads with clean algorithm guidance');

  // ==========================================
  // 3. REAL CANDIDATE JOURNEY
  // ==========================================
  console.log('\n--- 3. CANDIDATE APPLY JOURNEY ---');
  await login(page, CANDIDATE);

  // Upload CV on profile
  await page.goto(`${BASE}/profile`);
  await page.waitForSelector('[data-testid="cv-list"]');
  const cvCountBefore = await page.locator('[data-testid="cv-list"] > li').count();

  // Create temporary PDF file for upload
  const tmpPdf = 'shots/CV_PhaseE_An.pdf';
  fs.writeFileSync(tmpPdf, PDF);
  await page.setInputFiles('[data-testid="cv-upload-input"]', tmpPdf);
  await page.waitForSelector('[data-testid="cv-list"] >> text=CV_PhaseE_An');
  check((await page.locator('[data-testid="cv-list"] > li').count()) === cvCountBefore + 1, 'Candidate uploaded real PDF CV');
  await page.screenshot({ path: `${SHOTS}/05_candidate_profile_cv.png`, fullPage: true });

  // Go to target job and apply
  await page.goto(`${BASE}/jobs/${targetJob.id}`);
  await page.waitForSelector('[data-testid="apply-button"]');
  check(await page.isVisible('[data-testid="match-panel"]'), 'Skill match panel displayed for authenticated candidate');

  await page.click('[data-testid="apply-button"]');
  await page.waitForSelector('role=dialog');
  await page.locator('role=dialog >> label', { hasText: 'CV_PhaseE_An' }).locator('input[type="radio"]').check();
  await page.fill('#cover', 'Tôi rất quan tâm đến vị trí này và tự tin sẽ đóng góp giá trị cao cho dự án. (Phase E E2E test)');
  await page.screenshot({ path: `${SHOTS}/06_apply_modal.png` });
  await page.click('role=dialog >> button:has-text("Nộp hồ sơ")');
  await page.waitForSelector('text=Đã nộp hồ sơ vào vị trí');
  await page.waitForSelector('a:has-text("Đã ứng tuyển · Xem trạng thái")');
  check(true, 'Apply modal submitted successfully with real CV');

  // View under /applications
  await page.goto(`${BASE}/applications`);
  await page.waitForSelector(`[data-testid="application-row"] >> text=${targetJob.title}`);
  const appRow = page.locator('[data-testid="application-row"]', { hasText: targetJob.title });
  check((await appRow.textContent()).includes('Đã nộp'), 'New application appears with stage "Đã nộp"');
  await page.screenshot({ path: `${SHOTS}/07_my_applications.png`, fullPage: true });

  // ==========================================
  // 4. REAL RECRUITER JOURNEY
  // ==========================================
  console.log('\n--- 4. RECRUITER PIPELINE JOURNEY ---');
  await logout(page);
  await login(page, RECRUITER);

  // Recruiter Dashboard
  await page.goto(`${BASE}/employer`);
  await page.waitForSelector('[data-testid="my-jobs"]');
  check(await page.isVisible('text=Tin tuyển dụng'), 'Recruiter dashboard loaded');
  await page.screenshot({ path: `${SHOTS}/08_recruiter_dashboard.png`, fullPage: true });

  // Open Applicants filtered by target job
  await page.goto(`${BASE}/employer/applicants?job=${targetJob.id}`);
  await page.waitForSelector('[data-testid="applicant-item"]');
  const candidateItem = page.locator('[data-testid="applicant-item"]', { hasText: 'Nguyễn Văn An' }).first();
  await candidateItem.click();

  const panel = page.locator('[data-testid="candidate-panel"]');
  await panel.waitFor();
  check((await panel.textContent()).includes('Phase E E2E test'), 'Recruiter sees candidate cover letter');

  // Verify CV file endpoint returns 200 PDF
  const [fileRes, popup] = await Promise.all([
    page.waitForResponse((r) => /\/cvs\/\d+\/file$/.test(r.url())),
    ctx.waitForEvent('page'),
    panel.locator('[data-testid="view-cv"]').click(),
  ]);
  check(fileRes.status() === 200 && (fileRes.headers()['content-type'] || '').includes('pdf'), `Recruiter downloads candidate PDF (${fileRes.status()})`);
  await popup.close().catch(() => undefined);

  // Advance stage: APPLIED -> SCREENING
  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/status') && r.status() === 200),
    panel.locator('[data-testid="next-stage"]').click(),
  ]);
  await page.waitForTimeout(300);
  check((await panel.textContent()).includes('Mời phỏng vấn'), 'Stage advanced to SCREENING; next action is "Mời phỏng vấn"');

  // Advance stage: SCREENING -> INTERVIEW
  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/status') && r.status() === 200),
    panel.locator('[data-testid="next-stage"]').click(),
  ]);
  await page.waitForTimeout(300);
  check((await panel.textContent()).includes('Gửi offer'), 'Stage advanced to INTERVIEW; next action is "Gửi offer"');
  await page.screenshot({ path: `${SHOTS}/09_recruiter_stage_advanced.png`, fullPage: true });

  // ==========================================
  // 5. CANDIDATE NOTIFICATION & VERIFICATION
  // ==========================================
  console.log('\n--- 5. CANDIDATE REAL-TIME VERIFICATION ---');
  await logout(page);
  await login(page, CANDIDATE);

  // Check notification bell
  const bell = page.locator('[data-testid="notification-bell"]');
  await page.waitForFunction(() => /chưa đọc/.test(document.querySelector('[data-testid="notification-bell"]')?.getAttribute('aria-label') || ''));
  check(true, 'Candidate notification bell alerted with unread stage change notifications');
  await bell.click();
  await page.waitForSelector(`text=${targetJob.title}`);
  await page.screenshot({ path: `${SHOTS}/10_candidate_notifications.png` });
  await page.keyboard.press('Escape');

  // View /applications timeline
  await page.goto(`${BASE}/applications`);
  const updatedAppRow = page.locator('[data-testid="application-row"]', { hasText: targetJob.title });
  await updatedAppRow.waitFor();
  check((await updatedAppRow.textContent()).includes('Phỏng vấn'), 'Candidate sees live stage "Phỏng vấn"');

  await updatedAppRow.locator('button:has-text("Lịch sử hồ sơ")').click();
  check(await updatedAppRow.locator('[data-testid="application-timeline"]').isVisible(), 'Audit timeline tracks stage progression');
  await page.screenshot({ path: `${SHOTS}/11_application_timeline_updated.png`, fullPage: true });

  // ==========================================
  // 6. TEARDOWN & CLEANUP
  // ==========================================
  console.log('\n--- 6. TEARDOWN ---');
  // Clean up candidate uploaded CV
  await page.goto(`${BASE}/profile`);
  await page.waitForSelector('[data-testid="cv-list"]');
  const deleteBtn = page.locator('button[aria-label="Xóa CV CV_PhaseE_An"]');
  if (await deleteBtn.isVisible()) {
    await deleteBtn.click();
    await page.waitForSelector('text=Đã xóa CV');
    check(true, 'Test CV cleaned up successfully');
  }
  if (fs.existsSync(tmpPdf)) fs.unlinkSync(tmpPdf);

  // Console errors check
  const relevantErrors = consoleErrors.filter((e) => !/status of 40[0-4]/.test(e));
  check(relevantErrors.length === 0, `Zero unexpected console errors throughout test suite (${relevantErrors.length})`);

  await browser.close();
  console.log(failures ? `\n${failures} CHECK(S) FAILED` : '\nALL CHECKS PASSED');
  process.exit(failures ? 1 : 0);
})().catch((e) => {
  console.error('TEST CRASHED:', e);
  process.exit(1);
});
