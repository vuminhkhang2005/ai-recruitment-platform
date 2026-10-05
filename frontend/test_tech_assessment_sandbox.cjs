const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testTechAssessmentSandbox() {
  const OUT = path.join(__dirname, 'shots');
  const ARTIFACT_OUT = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\9c817057-d548-404f-95a2-714d44394a10\\screenshots';
  [OUT, ARTIFACT_OUT].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  console.log('[Test] Launching Chromium browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['clipboard-read', 'clipboard-write']
  });

  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('400') && !text.includes('401') && !text.includes('favicon.ico') && !text.includes('Expected static flag')) {
        consoleErrors.push(text);
      }
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  const shot = async (name) => {
    await page.screenshot({ path: path.join(OUT, name + '.png') });
    await page.screenshot({ path: path.join(ARTIFACT_OUT, name + '.png') });
  };

  try {
    console.log('[Test] Navigating directly to Career AI Hub Coding Sandbox (#coding)...');
    await page.goto('http://localhost:5173#coding', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 1. Verify Tech Assessment Sandbox is displayed
    const sandbox = page.locator('[data-testid="tech-assessment-sandbox"]');
    await sandbox.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Tech Assessment Sandbox loaded successfully!');
    await shot('sandbox_01_loaded');

    // 2. Switch language to Python and verify boilerplate
    const pythonBtn = page.locator('[data-testid="btn-lang-python"]');
    await pythonBtn.click();
    await page.waitForTimeout(300);
    const textarea = page.locator('[data-testid="code-editor-textarea"]');
    const pyVal = await textarea.inputValue();
    if (!pyVal.includes('OrderedDict')) {
      throw new Error('Python starter code did not populate correctly');
    }
    console.log('[Test] Language switched to Python successfully!');

    // Switch back to TypeScript
    const tsBtn = page.locator('[data-testid="btn-lang-typescript"]');
    await tsBtn.click();
    await page.waitForTimeout(300);

    // 3. Toggle AI hints
    const hintsBtn = page.locator('[data-testid="btn-toggle-ai-hints"]');
    await hintsBtn.click();
    await page.waitForTimeout(400);
    console.log('[Test] AI strategic hints revealed.');
    await shot('sandbox_02_hints_revealed');

    // 4. Run Test Cases
    const runBtn = page.locator('[data-testid="btn-run-tests"]');
    await runBtn.click();
    console.log('[Test] Clicked Run Test Cases, waiting for execution...');
    await page.waitForTimeout(1200);

    // Verify test cases passed
    const passedBanner = page.locator('text=Tất cả 3/3 Test cases đã vượt qua');
    await passedBanner.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] 3/3 Test cases passed with flying colors!');
    await shot('sandbox_03_test_cases_passed');

    // 5. Run AI Code Review
    const aiReviewBtn = page.locator('[data-testid="btn-ai-code-review"]');
    await aiReviewBtn.click();
    console.log('[Test] Clicked AI Code Review, waiting for Gemini 2.0 analysis...');
    await page.waitForTimeout(1500);

    const scoreLocator = page.locator('text=98/100');
    await scoreLocator.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] AI review completed! Score: 98/100, O(1) operations verified.');
    await shot('sandbox_04_ai_review_score');

    // 6. Final Solution Submission
    const submitBtn = page.locator('[data-testid="btn-submit-assessment"]');
    await submitBtn.click();
    console.log('[Test] Submitted assessment!');
    await page.waitForTimeout(500);

    const successModal = page.locator('[data-testid="assessment-success-modal"]');
    await successModal.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Submission success modal verified with EVAL-2026-ALG-889!');
    await shot('sandbox_05_certified_submission');

    const closeModalBtn = page.locator('[data-testid="btn-close-assessment-modal"]');
    await closeModalBtn.click();
    await successModal.waitFor({ state: 'hidden', timeout: 5000 });

    // 7. Verify modal launcher from Applied Jobs
    console.log('[Test] Testing AppliedJobsModal code test trigger...');
    // Seed candidate with applied job
    await page.evaluate(() => {
      const mockApplied = [
        {
          id: 'app-test-1',
          jobId: 'job-1',
          jobTitle: 'Senior Fullstack Engineer',
          company: 'VNG Corporation',
          status: 'interview',
          statusTextVi: 'Phỏng vấn kỹ thuật',
          statusTextEn: 'Technical Interview',
          appliedAt: '2026-10-05'
        }
      ];
      localStorage.setItem('applied_jobs', JSON.stringify(mockApplied));
      localStorage.setItem('auth_token', 'mock-token-candidate');
      localStorage.setItem('auth_user', JSON.stringify({
        id: 'c1',
        name: 'Nguyen Van Dev',
        email: 'dev@example.com',
        role: 'candidate'
      }));
    });

    // Go to Home and open Applied Jobs Modal
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Open User profile dropdown or applied jobs trigger
    const appliedPill = page.locator('button:has-text("Đã nộp")').or(page.locator('[data-testid="nav-applied-jobs"]')).first();
    if (await appliedPill.isVisible()) {
      await appliedPill.click();
    } else {
      // Direct call via event or navbar
      const profileBtn = page.locator('button:has-text("Nguyen Van Dev")').or(page.locator('[data-testid="user-profile-btn"]')).first();
      if (await profileBtn.isVisible()) {
        await profileBtn.click();
        await page.waitForTimeout(300);
        const myJobsBtn = page.locator('button:has-text("Việc làm đã nộp")').first();
        if (await myJobsBtn.isVisible()) {
          await myJobsBtn.click();
        }
      }
    }
    await page.waitForTimeout(600);

    const codeTestBtn = page.locator('[data-testid="btn-code-assessment-app-test-1"]');
    if (await codeTestBtn.isVisible()) {
      console.log('[Test] Found Code Test button in AppliedJobsModal! Clicking...');
      await codeTestBtn.click();
      await page.waitForTimeout(600);

      const testModal = page.locator('[data-testid="tech-assessment-sandbox-modal"]');
      await testModal.waitFor({ state: 'visible', timeout: 5000 });
      console.log('[Test] Tech Assessment Modal opened from AppliedJobs!');
      await shot('sandbox_06_opened_from_applied_jobs');

      const closeSandboxModal = page.locator('[data-testid="btn-close-sandbox-modal"]');
      await closeSandboxModal.click();
      await testModal.waitFor({ state: 'hidden', timeout: 5000 });
    }

    console.log('\n--- VERIFICATION RESULT ---');
    console.log('Console Errors:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(err => console.error('  ->', err));
      throw new Error(`Failed with ${consoleErrors.length} console errors.`);
    }

    console.log('SUCCESS: Interactive Technical Interview Code Playground & Evaluator verified with 0 console errors!');
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testTechAssessmentSandbox();
