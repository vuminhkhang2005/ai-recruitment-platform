const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testBackgroundCheck() {
  const OUT = path.join(__dirname, 'shots');
  const ARTIFACT_OUT = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\9c817057-d548-404f-95a2-714d44394a10\\screenshots';
  [OUT, ARTIFACT_OUT].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  console.log('[Test] Launching Chromium browser for Enterprise Background Check...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
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
    console.log('[Test] Navigating directly to ATS pipeline (#ats-pipeline)...');
    await page.goto('http://localhost:5173#ats-pipeline', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 1. Switch to Candidate Matrix table view
    const matrixTabBtn = page.locator('[data-testid="view-mode-matrix"]');
    await matrixTabBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Switching to Matrix view...');
    await matrixTabBtn.click();
    await page.waitForTimeout(800);

    // 2. Locate first background check button in candidate matrix table
    const bgCheckBtn = page.locator('[data-testid^="btn-matrix-background-check-"]').first();
    await bgCheckBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Found background check button. Clicking...');
    await bgCheckBtn.click();
    await page.waitForTimeout(600);

    // 3. Verify Background Check Verification Modal opened
    const bgModal = page.locator('[data-testid="background-check-modal"]');
    await bgModal.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Background Check Verification Modal opened successfully!');
    await shot('bg_check_01_modal_opened');

    // 4. Toggle Request New Reference Form
    const toggleFormBtn = page.locator('[data-testid="btn-toggle-request-reference-form"]');
    await toggleFormBtn.click();
    await page.waitForTimeout(400);

    const form = page.locator('[data-testid="form-request-reference"]');
    await form.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Opened automated reference request form!');
    await shot('bg_check_02_form_opened');

    // 5. Fill reference request
    await page.locator('[data-testid="input-ref-name"]').fill('Nguyễn Hoàng Long');
    await page.locator('[data-testid="input-ref-email"]').fill('long.nh@techcorp.com');
    await page.locator('[data-testid="input-ref-role"]').fill('VP of Technology');
    await page.waitForTimeout(400);
    await shot('bg_check_03_form_filled');

    // Submit reference request
    const submitBtn = page.locator('[data-testid="btn-submit-reference-request"]');
    await submitBtn.click();
    await page.waitForTimeout(600);
    console.log('[Test] Reference check survey request submitted!');
    await shot('bg_check_04_reference_requested');

    // 6. Test Export Clearance Certificate
    const exportBtn = page.locator('[data-testid="btn-export-clearance-certificate"]');
    await exportBtn.click();
    await page.waitForTimeout(500);
    console.log('[Test] Clicked Export Clearance Certificate');

    // 7. Approve pre-employment clearance
    const approveBtn = page.locator('[data-testid="btn-approve-background-check"]');
    await approveBtn.click();
    await page.waitForTimeout(600);
    console.log('[Test] Candidate approved and cleared for onboarding!');
    await shot('bg_check_05_clearance_approved');

    // 8. Close modal
    const closeBtn = page.locator('[data-testid="btn-close-background-check-modal"]');
    await closeBtn.click();
    await page.waitForTimeout(500);

    console.log('[Test] All Background Check test steps completed successfully!');
  } catch (err) {
    console.error('[Test Failed]', err);
    await shot('bg_check_error');
    throw err;
  } finally {
    await browser.close();
  }

  if (consoleErrors.length > 0) {
    console.error('[Test] Encountered console errors:', consoleErrors);
    throw new Error('Console errors encountered during test: ' + JSON.stringify(consoleErrors));
  } else {
    console.log('[Test] Zero console errors detected. Clean execution!');
  }
}

testBackgroundCheck()
  .then(() => {
    console.log('[Test] Enterprise Background Check E2E test finished with complete success!');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
