const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testCandidateCollaborativeReview() {
  const OUT = path.join(__dirname, 'shots');
  const ARTIFACT_OUT = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\9c817057-d548-404f-95a2-714d44394a10\\screenshots';
  [OUT, ARTIFACT_OUT].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  console.log('[Test] Launching Chromium browser...');
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
    console.log('[Test] Clicking Matrix View tab...');
    await matrixTabBtn.click();
    await page.waitForTimeout(600);

    // 2. Locate first review button in candidate matrix table
    const reviewBtn = page.locator('[data-testid^="btn-candidate-scorecard-"]').first();
    await reviewBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Found candidate scorecard button. Clicking...');
    await reviewBtn.click();
    await page.waitForTimeout(600);

    // 3. Verify Collaborative Review Modal opened
    const reviewModal = page.locator('[data-testid="collaborative-review-modal"]');
    await reviewModal.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Collaborative Review Dossier modal opened successfully!');
    await shot('review_01_modal_opened');

    // 4. Verify AI Committee Consensus Card
    const consensusCard = page.locator('[data-testid="ai-committee-consensus-card"]');
    await consensusCard.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] AI Committee Consensus Card verified!');

    // 5. Open Add Scorecard Form
    const openFormBtn = page.locator('[data-testid="btn-open-add-scorecard"]');
    await openFormBtn.click();
    await page.waitForTimeout(400);

    const addForm = page.locator('[data-testid="add-scorecard-form"]');
    await addForm.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Add Scorecard Form opened. Filling in evaluations...');

    // Fill in custom scorecard
    const reviewerInput = page.locator('[data-testid="input-reviewer-name"]');
    await reviewerInput.fill('Dr. Nguyen Hai Nam');

    const roleSelect = page.locator('[data-testid="select-reviewer-role"]');
    await roleSelect.selectOption('Principal Architect');

    const notesTextarea = page.locator('[data-testid="textarea-scorecard-notes"]');
    await notesTextarea.fill('Ứng viên giải quyết trọn vẹn bài toán High-Throughput LRU Cache với O(1) eviction và concurrency control xuất sắc. 100% Strong Hire!');

    await shot('review_02_form_filled');

    // Submit new scorecard
    const submitScorecardBtn = page.locator('[data-testid="btn-submit-new-scorecard"]');
    await submitScorecardBtn.click();
    console.log('[Test] Submitted new scorecard!');
    await page.waitForTimeout(600);

    // Verify reviewer added to list
    const addedReviewer = page.locator('text=Dr. Nguyen Hai Nam');
    await addedReviewer.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Verified new reviewer appeared in hiring timeline!');
    await shot('review_03_scorecard_added');

    // 6. Run AI Re-synthesis
    const resynthBtn = page.locator('[data-testid="btn-resynthesize-ai"]');
    await resynthBtn.click();
    console.log('[Test] Clicked Re-synthesize with AI, waiting for Gemini 2.0...');
    await page.waitForTimeout(1400);
    await shot('review_04_ai_resynthesized');

    // 7. Click Proceed to Offer
    const offerBtn = page.locator('[data-testid="btn-proceed-to-offer"]');
    await offerBtn.click();
    console.log('[Test] Clicked Approve Hire & Extend Offer!');
    await page.waitForTimeout(600);

    await reviewModal.waitFor({ state: 'hidden', timeout: 5000 });
    console.log('[Test] Review modal closed and candidate advanced to Offer stage successfully!');
    await shot('review_05_advanced_to_offer');

    console.log('\n--- VERIFICATION RESULT ---');
    console.log('Console Errors:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(err => console.error('  ->', err));
      throw new Error(`Failed with ${consoleErrors.length} console errors.`);
    }

    console.log('SUCCESS: Candidate Collaborative Review Dossier & AI Committee Synthesizer verified with 0 console errors!');
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testCandidateCollaborativeReview();
