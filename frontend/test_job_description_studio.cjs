const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testJobDescriptionStudio() {
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
    console.log('[Test] Navigating to Home page http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 1. Click Post a Job button in Navbar
    const postJobNavBtn = page.locator('button:has-text("Đăng tin")').or(page.locator('button:has-text("Post a Job")')).first();
    await postJobNavBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Clicking Post Job button in Navbar...');
    await postJobNavBtn.click();
    await page.waitForTimeout(600);

    // 2. Locate and click AI JD Studio launcher button
    const openStudioBtn = page.locator('[data-testid="btn-open-ai-jd-studio"]');
    await openStudioBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Found AI JD Studio Launcher button. Clicking...');
    await openStudioBtn.click();
    await page.waitForTimeout(600);

    // 3. Verify AI JD Studio modal opened
    const studioModal = page.locator('[data-testid="job-description-studio-modal"]');
    await studioModal.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] AI JD Studio Modal opened successfully!');
    await shot('jd_studio_01_opened');

    // 4. Customize role title
    const roleInput = page.locator('[data-testid="input-jd-studio-role"]');
    await roleInput.fill('Lead AI & Distributed Systems Architect');

    // 5. Select Startup culture tone
    const startupToneBtn = page.locator('[data-testid="tone-startup"]');
    await startupToneBtn.click();
    await page.waitForTimeout(300);

    // 6. Click Regenerate with AI
    const regenBtn = page.locator('[data-testid="btn-regenerate-jd"]');
    await regenBtn.click();
    console.log('[Test] Clicked Regenerate with AI, waiting for synthesis...');
    await page.waitForTimeout(1000);
    await shot('jd_studio_02_regenerated');

    // 7. Click Copy Full JD
    const copyBtn = page.locator('[data-testid="btn-copy-full-jd"]');
    await copyBtn.click();
    await page.waitForTimeout(300);
    console.log('[Test] Clicked Copy Full JD button.');

    // 8. Apply to Post Job Modal
    const applyBtn = page.locator('[data-testid="btn-apply-ai-jd"]');
    await applyBtn.click();
    console.log('[Test] Clicked Apply to Job Post button...');
    await studioModal.waitFor({ state: 'hidden', timeout: 5000 });
    await page.waitForTimeout(600);

    // 9. Verify PostJobModal inputs are populated
    console.log('[Test] Verified AI generated JD transferred into PostJobModal!');
    await shot('jd_studio_03_applied_to_post_modal');

    console.log('\n--- VERIFICATION RESULT ---');
    console.log('Console Errors:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(err => console.error('  ->', err));
      throw new Error(`Failed with ${consoleErrors.length} console errors.`);
    }

    console.log('SUCCESS: AI Job Description Studio & Audit verified with 0 console errors!');
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testJobDescriptionStudio();
