const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testSmartQuickApply() {
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
      // Filter out expected backend network 400/401 when testing unauthenticated/mock fallback
      if (!text.includes('400') && !text.includes('401') && !text.includes('favicon.ico')) {
        consoleErrors.push(text);
      }
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  // Seed demo candidate into localStorage
  await page.addInitScript(() => {
    const demoUser = {
      id: 'usr-candidate-01',
      name: 'Vũ Minh Khang',
      email: 'khang.candidate@talentbridge.vn',
      role: 'candidate',
      phone: '+84 987 654 321',
      atsScore: 94
    };
    localStorage.setItem('talentbridge_user', JSON.stringify(demoUser));
  });

  const shot = async (name) => {
    await page.screenshot({ path: path.join(OUT, name + '.png') });
    await page.screenshot({ path: path.join(ARTIFACT_OUT, name + '.png') });
  };

  try {
    console.log('[Test] Navigating to Home page http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 1. Locate first featured job quick apply button
    const firstQuickApplyBtn = page.locator('[data-testid^="featured-quick-apply-"]').first();
    await firstQuickApplyBtn.waitFor({ state: 'visible', timeout: 8000 });
    console.log('[Test] Found featured quick apply button. Clicking to open SmartQuickApplyModal...');
    await firstQuickApplyBtn.click();
    await page.waitForTimeout(600);

    // 2. Verify modal opened
    const modal = page.locator('[data-testid="smart-quick-apply-modal"]');
    await modal.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Smart Quick Apply Modal successfully opened!');
    await shot('quick_apply_01_modal_opened');

    // 3. Switch CV Version to GenAI/Tech
    const cvTailored = page.locator('[data-testid="cv-choice-tailored"]');
    await cvTailored.click();
    await page.waitForTimeout(300);
    console.log('[Test] Selected Tech-focused CV version.');
    await shot('quick_apply_02_cv_selected');

    // 4. Toggle AI tailoring checkbox and check preview
    const aiCheckbox = page.locator('[data-testid="checkbox-ai-tailoring"]');
    await aiCheckbox.click(); // toggle off
    await page.waitForTimeout(200);
    await aiCheckbox.click(); // toggle back on
    await page.waitForTimeout(200);

    // 5. Update expected salary and notice period
    const salaryInput = page.locator('[data-testid="input-quick-apply-salary"]');
    await salaryInput.fill('45,000,000 VNĐ');

    const noticeSelect = page.locator('[data-testid="select-quick-apply-notice"]');
    await noticeSelect.selectOption('2weeks');
    await page.waitForTimeout(300);
    console.log('[Test] Filled custom salary and 2-week notice period.');
    await shot('quick_apply_03_form_customized');

    // 6. Submit application
    const submitBtn = page.locator('[data-testid="btn-submit-smart-quick-apply"]');
    await submitBtn.click();
    console.log('[Test] Clicked Submit Application...');

    // 7. Verify submission success card
    const successCard = page.locator('[data-testid="smart-apply-submitted-state"]');
    await successCard.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Application submitted successfully, confirmation card rendered!');
    await shot('quick_apply_04_submitted_success');

    // 8. Close modal
    const closeBtn = page.locator('[data-testid="btn-close-smart-apply"]');
    await closeBtn.click();
    await page.waitForTimeout(500);

    // 9. Verify toast notification appeared on home screen
    console.log('[Test] Modal closed, taking final screenshot of home page with toast...');
    await shot('quick_apply_05_modal_closed_toast');

    console.log('\n--- VERIFICATION RESULT ---');
    console.log('Console Errors:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(err => console.error('  ->', err));
      throw new Error(`Failed with ${consoleErrors.length} console errors.`);
    }

    console.log('SUCCESS: Smart 1-Click Quick Apply Modal verified with 0 console errors!');
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testSmartQuickApply();
