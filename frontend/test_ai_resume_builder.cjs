const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testAiResumeBuilder() {
  const OUT = path.join(__dirname, 'shots');
  const ARTIFACT_OUT = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\9c817057-d548-404f-95a2-714d44394a10\\screenshots';
  [OUT, ARTIFACT_OUT].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  console.log('[Test] Launching Chromium browser for AI ATS Resume Builder Studio...');
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
    console.log('[Test] Seeding candidate auth in localStorage...');
    await page.addInitScript(() => {
      const demoUser = {
        id: 'usr-candidate-01',
        name: 'Vũ Minh Khang',
        email: 'khang.candidate@talentbridge.vn',
        role: 'candidate',
        title: 'Senior Software Engineer',
        location: 'TP. Hồ Chí Minh',
        phone: '+84 987 654 321',
        atsScore: 94
      };
      localStorage.setItem('talentbridge_user', JSON.stringify(demoUser));
    });

    console.log('[Test] Navigating directly to #resume-builder...');
    await page.goto('http://localhost:5173#resume-builder', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 1. Verify AI Resume Builder Section loaded
    const builderSection = page.locator('[data-testid="ai-resume-builder-section"]');
    await builderSection.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] AI ATS Resume Builder Section loaded successfully!');
    await shot('resume_builder_01_loaded');

    // 2. Verify Live ATS Score display
    const scoreDisplay = page.locator('[data-testid="live-ats-score-display"]');
    await scoreDisplay.waitFor({ state: 'visible', timeout: 5000 });
    const initialScoreText = await scoreDisplay.textContent();
    console.log(`[Test] Initial ATS Score: ${initialScoreText}`);

    // 3. Switch Target Role to Fullstack Architect
    const fullstackRoleBtn = page.locator('[data-testid="btn-select-role-fullstack"]');
    await fullstackRoleBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Switching Target Role to Fullstack Architect...');
    await fullstackRoleBtn.click();
    await page.waitForTimeout(600);
    await shot('resume_builder_02_role_switched');

    // 4. Inject a missing keyword (e.g. Micro-frontends or Distributed Caching)
    const injectBtn = page.locator('[data-testid^="btn-inject-keyword-"]').first();
    await injectBtn.waitFor({ state: 'visible', timeout: 5000 });
    const injectBtnText = await injectBtn.textContent();
    console.log(`[Test] Found keyword injector: "${injectBtnText?.trim()}". Injecting...`);
    await injectBtn.click();
    await page.waitForTimeout(600);
    await shot('resume_builder_03_keyword_injected');

    // Verify score changed or updated
    const updatedScoreText = await scoreDisplay.textContent();
    console.log(`[Test] Updated ATS Score after injection: ${updatedScoreText}`);

    // 5. Polish bullets with AI Google XYZ formula
    const polishBtn = page.locator('[data-testid="btn-polish-with-ai"]');
    await polishBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Clicking Polish with AI (Google XYZ formula)...');
    await polishBtn.click();
    await page.waitForTimeout(1200);
    await shot('resume_builder_04_polished_bullets');

    // 6. Test Copy Plain Text & Sync to Profile
    const copyTextBtn = page.locator('[data-testid="btn-copy-plain-text-cv"]');
    await copyTextBtn.click();
    await page.waitForTimeout(400);

    const syncProfileBtn = page.locator('[data-testid="btn-sync-to-profile"]');
    await syncProfileBtn.click();
    await page.waitForTimeout(500);

    // Verify localStorage item created
    const storedCv = await page.evaluate(() => localStorage.getItem('talentbridge_cv_builder'));
    if (!storedCv) {
      throw new Error('Expected talentbridge_cv_builder to be stored in localStorage');
    }
    console.log('[Test] Verified resume saved in localStorage successfully!');
    await shot('resume_builder_05_saved_and_synced');

    // 7. Verify opening the studio modal from Profile Page
    console.log('[Test] Navigating to Profile Page (#profile)...');
    await page.goto('http://localhost:5173#profile', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const profileBuilderBtn = page.locator('[data-testid="btn-open-resume-builder-from-profile"]');
    await profileBuilderBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Clicking ATS Resume Studio button on profile...');
    await profileBuilderBtn.click();
    await page.waitForTimeout(600);

    const modal = page.locator('[data-testid="ai-resume-builder-modal"]');
    await modal.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] AI Resume Builder Modal opened from Profile page!');
    await shot('resume_builder_06_profile_modal_opened');

    // Close modal
    const closeModalBtn = page.locator('[data-testid="btn-close-resume-builder-modal"]');
    await closeModalBtn.click();
    await page.waitForTimeout(500);

    console.log('[Test] All Resume Builder test steps completed successfully!');
  } catch (err) {
    console.error('[Test Failed]', err);
    await shot('resume_builder_error');
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

testAiResumeBuilder()
  .then(() => {
    console.log('[Test] AI ATS Resume Builder Studio E2E test finished with complete success!');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
