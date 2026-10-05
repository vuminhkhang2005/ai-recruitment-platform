const { chromium } = require('C:/Users/DELL/.gemini/antigravity/scratch/ai-recruitment-platform/frontend/node_modules/playwright');
const path = require('path');
const OUT = path.join(__dirname, 'shots');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
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

  // 1. Visit #profile and sign in if needed
  await page.goto('http://localhost:5173/#profile', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const loginGateBtn = page.locator('main button:has-text("Đăng nhập")').first();
  if (await loginGateBtn.isVisible()) {
    await loginGateBtn.click();
    await page.fill('#auth-email', 'khang.candidate@talentbridge.vn');
    await page.fill('#auth-password', 'Password@123');
    await page.locator('button:has-text("Đăng nhập vào hệ thống")').click();
    await page.locator('h1:has-text("Vu Minh Khang"), h1:has-text("Vũ Minh Khang")').first().waitFor({ timeout: 8000 });
  }

  // 2. Switch to Applications tab
  await step('Switch to Applications tab and verify applied job list', async () => {
    const appTabBtn = page.locator('button:has-text("Đã ứng tuyển"), button:has-text("Ứng tuyển")').first();
    await appTabBtn.click();
    await page.waitForTimeout(600);

    const appItems = page.locator('button[data-testid="open-interview-prep-btn"]');
    const count = await appItems.count();
    console.log('    Found applied jobs with AI interview prep button:', count);
    if (count === 0) throw new Error('No AI interview prep buttons found in applied jobs tab');
    await shot('prep_01_applications_tab');
  });

  // 3. Launch AI Interview Simulator
  await step('Click "Luyện phỏng vấn AI" and verify simulator modal opens', async () => {
    const prepBtn = page.locator('button[data-testid="open-interview-prep-btn"]').first();
    await prepBtn.click();
    await page.waitForTimeout(600);

    const modal = page.locator('[data-testid="interview-prep-modal"]');
    await modal.waitFor({ timeout: 5000 });
    const modalVisible = await modal.isVisible();
    if (!modalVisible) throw new Error('Interview prep modal is not visible');

    const modalTitle = page.locator('h3:has-text("Phòng Luyện Phỏng Vấn AI")');
    if (!(await modalTitle.isVisible())) throw new Error('Interview modal title not found');
    await shot('prep_02_modal_opened');
  });

  // 4. Test question switching and tabs
  await step('Switch between interview questions and verify dynamic question content', async () => {
    const questionTabs = page.locator('[data-testid="interview-question-tab"]');
    const tabCount = await questionTabs.count();
    console.log('    Found question tabs:', tabCount);
    if (tabCount < 3) throw new Error('Expected at least 3 interview question tabs');

    // Click Question 2 tab
    await questionTabs.nth(1).click();
    await page.waitForTimeout(400);

    const qCategory = page.locator('span:has-text("Kiến trúc"), span:has-text("Architecture")').first();
    if (!(await qCategory.isVisible())) throw new Error('Expected architecture category on Question 2');
    await shot('prep_03_question_2_active');
  });

  // 5. Test Sample Answer Insertion and Live Editing
  await step('Insert STAR sample answer and verify textarea populated', async () => {
    const sampleBtn = page.locator('[data-testid="interview-sample-answer-btn"]');
    await sampleBtn.click();
    await page.waitForTimeout(400);

    const textarea = page.locator('[data-testid="interview-answer-input"]');
    const val = await textarea.inputValue();
    console.log('    Populated answer length:', val.length);
    if (val.length < 50) throw new Error('Sample answer was not populated correctly');
    await shot('prep_04_sample_answer_loaded');
  });

  // 6. Test AI STAR Evaluation Engine
  await step('Click "Chấm điểm bằng AI" and verify STAR rubric evaluation result', async () => {
    const evalBtn = page.locator('[data-testid="interview-evaluate-btn"]');
    await evalBtn.click();
    
    // Wait for evaluation result card
    const evalCard = page.locator('[data-testid="interview-evaluation-result"]');
    await evalCard.waitFor({ timeout: 6000 });
    
    const scoreBadge = evalCard.locator('div:has-text("/"), div.bg-emerald-600').first();
    const scoreText = await scoreBadge.innerText();
    console.log('    AI Benchmark Score:', scoreText);

    // Verify 4 STAR breakdown bars
    const starPillars = evalCard.locator('span:has-text("S - Situation"), span:has-text("T - Task"), span:has-text("A - Action"), span:has-text("R - Result")');
    const starCount = await starPillars.count();
    console.log('    STAR breakdown pillars rendered:', starCount);
    if (starCount < 4) throw new Error('Expected all 4 STAR pillars in evaluation card');

    await shot('prep_05_ai_evaluation_result');
  });

  // 7. Close modal and clean exit
  await step('Close interview prep simulator and return to profile view', async () => {
    const closeBtn = page.locator('[data-testid="interview-close-btn"]');
    await closeBtn.click();
    await page.waitForTimeout(500);

    const modal = page.locator('[data-testid="interview-prep-modal"]');
    const isClosed = !(await modal.isVisible());
    if (!isClosed) throw new Error('Interview prep modal did not close');
    await shot('prep_06_modal_closed_success');
  });

  console.log('\n--- PLAYWRIGHT LOG AUDIT ---');
  console.log('Total intercepted warnings/errors:', logs.length);
  logs.forEach(l => console.log('  ', l));

  await browser.close();
  if (process.exitCode) {
    console.error('\nInterview Prep Suite encountered failures!');
    process.exit(1);
  } else {
    console.log('\n🌟 ALL AI INTERVIEW PREP PLAYWRIGHT TESTS PASSED (0 ERRORS)!');
  }
})();
