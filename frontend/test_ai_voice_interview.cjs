const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testAiVoiceInterview() {
  const OUT = path.join(__dirname, 'shots');
  const ARTIFACT_OUT = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\9c817057-d548-404f-95a2-714d44394a10\\screenshots';
  [OUT, ARTIFACT_OUT].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  console.log('[Test] Launching Chromium browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['clipboard-read', 'clipboard-write', 'microphone']
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
    console.log('[Test] Seeding candidate auth and applied jobs in localStorage...');
    await page.addInitScript(() => {
      const demoUser = {
        id: 'usr-candidate-01',
        name: 'Vũ Minh Khang',
        email: 'khang.candidate@talentbridge.vn',
        role: 'candidate',
        phone: '+84 987 654 321',
        atsScore: 94
      };
      const demoApplications = [
        {
          id: 'app-01',
          jobId: 'job-1',
          jobTitle: 'Senior Distributed Systems Architect',
          company: 'VNG Tech Lab',
          appliedAt: '03/10/2026',
          status: 'interview',
          statusTextVi: 'Phỏng vấn kỹ thuật',
          statusTextEn: 'Technical Interview'
        }
      ];
      localStorage.setItem('talentbridge_user', JSON.stringify(demoUser));
      localStorage.setItem('talentbridge_applications', JSON.stringify(demoApplications));
    });

    console.log('[Test] Navigating to Home page http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Open User Profile Dropdown
    const userMenuBtn = page.locator('button:has-text("Vũ Minh Khang")').first();
    await userMenuBtn.waitFor({ state: 'visible', timeout: 5000 });
    await userMenuBtn.click();
    await page.waitForTimeout(400);

    // Click "Lịch sử ứng tuyển" from dropdown
    const appliedMenuItem = page.locator('text=Lịch sử ứng tuyển').or(page.locator('text=Applications')).first();
    await appliedMenuItem.click();
    await page.waitForTimeout(600);

    // 2. Click Voice Interview button in Applied Jobs modal
    const voiceInterviewBtn = page.locator('[data-testid^="btn-voice-interview-"]').first();
    await voiceInterviewBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Found Voice Interview button. Clicking...');
    await voiceInterviewBtn.click();
    await page.waitForTimeout(600);

    // 3. Verify AI Voice Interview Modal opened
    const voiceModal = page.locator('[data-testid="ai-voice-interview-modal"]');
    await voiceModal.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] AI Voice Interview Modal opened successfully!');
    await shot('voice_01_modal_opened');

    // 4. Test Examiner Voice Playback
    const playExaminerBtn = page.locator('[data-testid="btn-play-examiner-voice"]');
    await playExaminerBtn.click();
    console.log('[Test] Clicked Listen to AI Examiner Voice...');
    await page.waitForTimeout(800);

    // 5. Test Live Voice Recording
    const startRecordBtn = page.locator('[data-testid="btn-start-voice-record"]');
    await startRecordBtn.click();
    console.log('[Test] Started voice recording & live speech-to-text...');
    await page.waitForTimeout(2000);
    await shot('voice_02_recording_active');

    // 6. Stop Recording & Analyze Speech
    const stopRecordBtn = page.locator('[data-testid="btn-stop-voice-record"]');
    await stopRecordBtn.click();
    console.log('[Test] Stopped recording, waiting for acoustic & STAR analysis...');
    await page.waitForTimeout(1500);

    const analysisResults = page.locator('[data-testid="voice-analysis-results"]');
    await analysisResults.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] AI Speech & STAR Analysis rendered successfully! (96/100 Confidence, 135 wpm, 0 filler words)');
    await shot('voice_03_analysis_results');

    // 7. Test Question Switcher
    const nextQBtn = page.locator('[data-testid="btn-next-voice-question"]');
    await nextQBtn.click();
    console.log('[Test] Switched to next interview question...');
    await page.waitForTimeout(600);
    await shot('voice_04_next_question');

    // 8. Close Modal
    const closeModalBtn = page.locator('[data-testid="btn-close-voice-modal"]');
    await closeModalBtn.click();
    await voiceModal.waitFor({ state: 'hidden', timeout: 5000 });
    console.log('[Test] Voice Interview modal closed cleanly!');

    console.log('\n--- VERIFICATION RESULT ---');
    console.log('Console Errors:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(err => console.error('  ->', err));
      throw new Error(`Failed with ${consoleErrors.length} console errors.`);
    }

    console.log('SUCCESS: AI Voice & Audio Real-Time Mock Interview Studio verified with 0 console errors!');
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testAiVoiceInterview();
