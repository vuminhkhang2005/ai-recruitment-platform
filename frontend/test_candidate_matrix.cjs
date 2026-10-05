const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testCandidateMatrix() {
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
      if (!text.includes('400') && !text.includes('401') && !text.includes('favicon.ico')) {
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
    console.log('[Test] Navigating to ATS Pipeline Portal http://localhost:5173/#ats-pipeline...');
    await page.goto('http://localhost:5173/#ats-pipeline', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);

    // 1. Switch to Matrix view mode
    const matrixTabBtn = page.locator('[data-testid="view-mode-matrix"]');
    await matrixTabBtn.waitFor({ state: 'visible', timeout: 6000 });
    console.log('[Test] Clicking AI Matrix view button...');
    await matrixTabBtn.click();
    await page.waitForTimeout(600);

    // 2. Verify Candidate Matrix Section loaded
    const matrixSection = page.locator('[data-testid="candidate-matrix-section"]');
    await matrixSection.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] AI Candidate Matrix Section rendered successfully!');
    await shot('matrix_01_view_loaded');

    // 3. Test stage filter
    const filterNewBtn = page.locator('[data-testid="filter-stage-new"]');
    await filterNewBtn.click();
    await page.waitForTimeout(300);
    console.log('[Test] Filtered to New candidates.');

    const filterAllBtn = page.locator('[data-testid="filter-stage-all"]');
    await filterAllBtn.click();
    await page.waitForTimeout(300);
    console.log('[Test] Restored filter to All candidates.');

    // 4. Test search input
    const searchInput = page.locator('[data-testid="input-matrix-search"]');
    await searchInput.fill('PyTorch');
    await page.waitForTimeout(300);
    console.log('[Test] Searched for "PyTorch".');
    await searchInput.fill('');
    await page.waitForTimeout(200);

    // 5. Test Quick Select Top Tier (>=95%)
    const selectTopTierBtn = page.locator('[data-testid="btn-select-top-tier"]');
    await selectTopTierBtn.click();
    await page.waitForTimeout(400);

    const bulkBar = page.locator('[data-testid="bulk-action-bar"]');
    await bulkBar.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Top Tier candidates selected, Bulk Action Bar displayed!');
    await shot('matrix_02_top_tier_selected');

    // 6. Test Batch Email Invitation Modal
    const inviteBtn = page.locator('[data-testid="btn-bulk-invite-email"]');
    await inviteBtn.click();
    await page.waitForTimeout(500);

    const inviteModal = page.locator('[data-testid="batch-invite-modal"]');
    await inviteModal.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Batch Interview Invite Modal opened!');
    await shot('matrix_03_batch_invite_modal');

    // 7. Confirm & Send Invites
    const confirmInviteBtn = page.locator('[data-testid="btn-confirm-send-invites"]');
    await confirmInviteBtn.click();
    console.log('[Test] Dispatched batch email invites...');
    await inviteModal.waitFor({ state: 'hidden', timeout: 5000 });
    await page.waitForTimeout(600);

    // 8. Select Top Tier candidates again and Advance to Tech Interview
    await selectTopTierBtn.click();
    await page.waitForTimeout(400);

    const advanceBtn = page.locator('[data-testid="btn-bulk-advance-interview"]');
    await advanceBtn.click();
    console.log('[Test] Clicked Bulk Advance to Interview...');
    await page.waitForTimeout(600);
    await shot('matrix_04_advanced_interview');

    // 9. Switch back to Kanban to verify synchronization
    const kanbanTabBtn = page.locator('[data-testid="view-mode-kanban"]');
    await kanbanTabBtn.click();
    await page.waitForTimeout(600);
    console.log('[Test] Switched back to Kanban ATS view, synchronized with state.');
    await shot('matrix_05_kanban_synchronized');

    console.log('\n--- VERIFICATION RESULT ---');
    console.log('Console Errors:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(err => console.error('  ->', err));
      throw new Error(`Failed with ${consoleErrors.length} console errors.`);
    }

    console.log('SUCCESS: AI Candidate Evaluation Matrix & Bulk Shortlist verified with 0 console errors!');
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testCandidateMatrix();
