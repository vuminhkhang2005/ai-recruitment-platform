const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testInterviewScheduler() {
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

  // Seed user and applied jobs into localStorage
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
        jobTitle: 'Senior AI / Deep Learning Engineer',
        company: 'VNG Corporation',
        appliedAt: '03/10/2026',
        status: 'interview',
        statusTextVi: 'Phỏng vấn kỹ thuật',
        statusTextEn: 'Technical Interview'
      }
    ];
    localStorage.setItem('talentbridge_user', JSON.stringify(demoUser));
    localStorage.setItem('talentbridge_applications', JSON.stringify(demoApplications));
  });

  const shot = async (name) => {
    await page.screenshot({ path: path.join(OUT, name + '.png') });
    await page.screenshot({ path: path.join(ARTIFACT_OUT, name + '.png') });
  };

  try {
    console.log('[Test] Navigating to Home page http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Open User Profile Dropdown or Applied Jobs
    // In Navbar, clicking the user profile menu opens profile or modals
    const userMenuBtn = page.locator('button:has-text("Vũ Minh Khang")').first();
    await userMenuBtn.waitFor({ state: 'visible', timeout: 5000 });
    await userMenuBtn.click();
    await page.waitForTimeout(400);

    // Click "Lịch sử ứng tuyển" from dropdown
    const appliedMenuItem = page.locator('text=Lịch sử ứng tuyển').or(page.locator('text=Applications')).first();
    await appliedMenuItem.click();
    await page.waitForTimeout(600);

    // Locate Sync Calendar button on the applied job card
    const syncCalendarBtn = page.locator('[data-testid^="btn-sync-calendar-"]').first();
    await syncCalendarBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Found Sync Calendar button. Clicking to open InterviewSchedulerModal...');
    await syncCalendarBtn.click();
    await page.waitForTimeout(600);

    // 1. Verify modal opened
    const modal = page.locator('[data-testid="interview-scheduler-modal"]');
    await modal.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Interview Scheduler Modal opened successfully!');
    await shot('scheduler_01_modal_opened');

    // 2. Customize Round, Date, and Time Slot
    const roundSelect = page.locator('[data-testid="select-round-type"]');
    await roundSelect.selectOption('system_design');

    const dateInput = page.locator('[data-testid="input-scheduler-date"]');
    await dateInput.fill('2026-10-15');

    const timeSlotSelect = page.locator('[data-testid="select-time-slot"]');
    await timeSlotSelect.selectOption('14:00 - 15:00');

    // Select Zoom format
    const zoomFormatBtn = page.locator('[data-testid="format-zoom"]');
    await zoomFormatBtn.click();
    await page.waitForTimeout(300);

    // Add note
    const notesInput = page.locator('[data-testid="input-scheduler-notes"]');
    await notesInput.fill('Chuẩn bị bài thuyết trình kiến trúc microservices và RAG pipeline.');
    await page.waitForTimeout(300);
    console.log('[Test] Customized interview round, date, slot, and format.');
    await shot('scheduler_02_form_customized');

    // 3. Confirm & Submit Schedule
    const submitBtn = page.locator('[data-testid="btn-submit-schedule"]');
    await submitBtn.click();
    await page.waitForTimeout(600);
    console.log('[Test] Clicked Confirm & Dispatch Calendar.');

    // 4. Verify Success State with Calendar Sync Actions
    const successCard = page.locator('[data-testid="scheduler-success-state"]');
    await successCard.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Interview scheduled successfully! Confirmation state rendered.');
    await shot('scheduler_03_scheduled_success');

    console.log('\n--- VERIFICATION RESULT ---');
    console.log('Console Errors:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(err => console.error('  ->', err));
      throw new Error(`Failed with ${consoleErrors.length} console errors.`);
    }

    console.log('SUCCESS: AI Interview Schedule & Calendar Coordinator verified with 0 console errors!');
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testInterviewScheduler();
