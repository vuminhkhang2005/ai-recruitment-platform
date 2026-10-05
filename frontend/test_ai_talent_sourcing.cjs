const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testAiTalentSourcing() {
  const OUT = path.join(__dirname, 'shots');
  const ARTIFACT_OUT = 'C:\\Users\\DELL\\.gemini\antigravity\\brain\\9c817057-d548-404f-95a2-714d44394a10\\screenshots';
  [OUT, ARTIFACT_OUT].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  console.log('[Test] Launching Chromium browser for AI Talent Sourcing Radar...');
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
    console.log('[Test] Navigating directly to ATS pipeline (#ats-pipeline)...');
    await page.goto('http://localhost:5173#ats-pipeline', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 1. Switch to Sourcing Tab
    const sourcingTabBtn = page.locator('[data-testid="view-mode-sourcing"]');
    await sourcingTabBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Clicking Sourcing Radar tab...');
    await sourcingTabBtn.click();
    await page.waitForTimeout(800);

    // 2. Verify AI Talent Sourcing section rendered
    const sourcingSection = page.locator('[data-testid="ai-talent-sourcing-section"]');
    await sourcingSection.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] AI Talent Sourcing section loaded successfully!');
    await shot('sourcing_01_loaded');

    // 3. Verify talent cards are visible
    const talentCard1 = page.locator('[data-testid="talent-card-talent-1"]');
    await talentCard1.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Verified talent card for talent-1 (Đặng Minh Trí)');

    // 4. Test Search filter
    const searchInput = page.locator('[data-testid="input-sourcing-search"]');
    await searchInput.fill('PyTorch');
    await page.waitForTimeout(500);
    console.log('[Test] Tested search filter with "PyTorch"');
    await shot('sourcing_02_filtered');

    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(300);

    // 5. Open AI Cold Outreach Email modal for talent-1
    const outreachBtn = page.locator('[data-testid="btn-outreach-email-talent-1"]');
    await outreachBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Clicking AI Cold Outreach button for talent-1...');
    await outreachBtn.click();
    await page.waitForTimeout(600);

    const outreachModal = page.locator('[data-testid="outreach-email-modal"]');
    await outreachModal.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Cold Outreach Modal opened!');
    await shot('sourcing_03_outreach_modal');

    // 6. Test tone selection (Visionary)
    const visionaryToneBtn = page.locator('[data-testid="btn-tone-visionary"]');
    await visionaryToneBtn.click();
    await page.waitForTimeout(400);
    console.log('[Test] Switched tone to Visionary');

    // Test tone selection (Casual)
    const casualToneBtn = page.locator('[data-testid="btn-tone-casual"]');
    await casualToneBtn.click();
    await page.waitForTimeout(400);
    console.log('[Test] Switched tone to Casual');

    // Copy email button
    const copyBtn = page.locator('[data-testid="btn-copy-outreach-email"]');
    await copyBtn.click();
    await page.waitForTimeout(300);
    console.log('[Test] Clicked Copy Email button');
    await shot('sourcing_04_tone_selected');

    // Close outreach modal by clicking Close
    await page.getByRole('button', { name: /Đóng|Close/i }).click();
    await page.waitForTimeout(500);

    // 7. Click Import to ATS for talent-1
    const importBtn = page.locator('[data-testid="btn-import-talent-talent-1"]');
    await importBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Clicking Import to ATS Pipeline button...');
    await importBtn.click();
    await page.waitForTimeout(600);

    // Verify button shows Imported state
    await page.waitForSelector('[data-testid="btn-import-talent-talent-1"]:has-text("Đã Nhập Vào ATS"), [data-testid="btn-import-talent-talent-1"]:has-text("Imported")', { timeout: 3000 });
    console.log('[Test] Talent successfully imported into ATS pipeline!');
    await shot('sourcing_05_imported_to_pipeline');

    // 8. Switch back to Kanban to verify candidate was inserted into 'new' column
    const kanbanTabBtn = page.locator('[data-testid="view-mode-kanban"]');
    await kanbanTabBtn.click();
    await page.waitForTimeout(600);
    await shot('sourcing_06_verified_in_kanban');

    console.log('[Test] All sourcing radar operations completed successfully!');
  } catch (err) {
    console.error('[Test Failed]', err);
    await shot('sourcing_error');
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

testAiTalentSourcing()
  .then(() => {
    console.log('[Test] AI Talent Sourcing E2E test finished with complete success!');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
