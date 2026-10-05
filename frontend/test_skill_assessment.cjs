const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testSkillAssessment() {
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

  // Seed demo candidate into localStorage
  await page.addInitScript(() => {
    const demoUser = {
      id: 'usr-candidate-01',
      name: 'Vũ Minh Khang',
      email: 'khang.candidate@talentbridge.vn',
      role: 'candidate',
      phone: '+84 987 654 321',
      atsScore: 94,
      skills: ['React', 'TypeScript', 'PyTorch', 'Docker']
    };
    localStorage.setItem('talentbridge_user', JSON.stringify(demoUser));
  });

  const shot = async (name) => {
    await page.screenshot({ path: path.join(OUT, name + '.png') });
    await page.screenshot({ path: path.join(ARTIFACT_OUT, name + '.png') });
  };

  try {
    console.log('[Test] Navigating to Profile Page http://localhost:5173/#profile...');
    await page.goto('http://localhost:5173/#profile', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);

    // 1. Switch to Skills & Assessment tab
    const skillsTab = page.locator('[data-testid="tab-profile-skills"]');
    await skillsTab.waitFor({ state: 'visible', timeout: 6000 });
    console.log('[Test] Clicking Skills & AI Assessment tab...');
    await skillsTab.click();
    await page.waitForTimeout(600);

    // 2. Verify Skill Assessment Section is rendered
    const assessmentSection = page.locator('[data-testid="skill-assessment-section"]');
    await assessmentSection.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Skill Assessment Section rendered successfully!');
    await shot('skills_01_loaded');

    // 3. Start AI & LLM Specialist Track
    const startAiTrackBtn = page.locator('[data-testid="btn-start-track-ai-deep-learning"]');
    await startAiTrackBtn.waitFor({ state: 'visible', timeout: 5000 });
    await startAiTrackBtn.click();
    await page.waitForTimeout(500);

    // 4. Verify Assessment Runner is rendered with Question 1
    const runner = page.locator('[data-testid="assessment-runner"]');
    await runner.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Assessment Runner active on Question 1.');

    // Select Option A (Correct for Q1)
    const optA1 = page.locator('[data-testid="option-btn-0"]');
    await optA1.click();
    await page.waitForTimeout(300);
    await shot('skills_02_question_answered');

    // Click Next Question
    const nextBtn = page.locator('[data-testid="btn-next-question"]');
    await nextBtn.click();
    await page.waitForTimeout(500);
    console.log('[Test] Moved to Question 2.');

    // Select Option A (Correct for Q2)
    const optA2 = page.locator('[data-testid="option-btn-0"]');
    await optA2.click();
    await page.waitForTimeout(300);
    await nextBtn.click();
    await page.waitForTimeout(500);
    console.log('[Test] Moved to Question 3.');

    // Select Option A (Correct for Q3)
    const optA3 = page.locator('[data-testid="option-btn-0"]');
    await optA3.click();
    await page.waitForTimeout(300);

    // Click Submit & Grade
    await nextBtn.click();
    await page.waitForTimeout(600);
    console.log('[Test] Submitted assessment for AI grading...');

    // 5. Verify Certificate Result Card
    const resultCard = page.locator('[data-testid="assessment-result-card"]');
    await resultCard.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Assessment graded! Verified Credential card rendered.');
    await shot('skills_03_credential_earned');

    // 6. Test Share Credential
    const shareBtn = page.locator('[data-testid="btn-share-certificate"]');
    await shareBtn.click();
    await page.waitForTimeout(400);
    console.log('[Test] Clicked Share Credential button.');

    console.log('\n--- VERIFICATION RESULT ---');
    console.log('Console Errors:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(err => console.error('  ->', err));
      throw new Error(`Failed with ${consoleErrors.length} console errors.`);
    }

    console.log('SUCCESS: AI Skill Assessment & Digital Credentials verified with 0 console errors!');
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testSkillAssessment();
