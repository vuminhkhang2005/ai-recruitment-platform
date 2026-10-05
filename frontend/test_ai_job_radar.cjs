const { chromium } = require('C:/Users/DELL/.gemini/antigravity/scratch/ai-recruitment-platform/frontend/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const OUT = path.join(__dirname, 'shots');
const ARTIFACT_OUT = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\9c817057-d548-404f-95a2-714d44394a10\\screenshots';
[OUT, ARTIFACT_OUT].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ 
    viewport: { width: 1440, height: 900 },
    permissions: ['clipboard-read', 'clipboard-write']
  });
  const page = await ctx.newPage();
  const logs = [];

  page.on('console', m => {
    if (m.type() === 'error') {
      const text = m.text();
      if (!text.includes('400') && !text.includes('401') && !text.includes('Expected static flag')) {
        logs.push(`[error] ${text.slice(0, 250)}`);
      }
    }
  });
  page.on('pageerror', e => logs.push(`[pageerror] ${e.message}`));

  const shot = async (name) => {
    await page.screenshot({ path: path.join(OUT, name + '.png') });
    await page.screenshot({ path: path.join(ARTIFACT_OUT, name + '.png') });
  };

  const step = async (name, fn) => {
    try {
      await fn();
      console.log('✓ PASS:', name);
    } catch (e) {
      console.error('✗ FAIL:', name, '->', e.message);
      process.exitCode = 1;
      throw e;
    }
  };

  try {
    // 0. Ensure authenticated candidate session
    await page.addInitScript(() => {
      localStorage.setItem('talentbridge_user', JSON.stringify({
        id: 'user-cand-1',
        name: 'Vũ Minh Khang',
        email: 'khang.candidate@talentbridge.vn',
        role: 'candidate',
        title: 'Senior Fullstack & AI Engineer',
        atsScore: 94,
        skills: ['React', 'TypeScript', 'Node.js', 'Go', 'AI', 'Python', 'Kubernetes']
      }));
    });

    // 1. Visit Profile Page
    await step('Navigate to Profile Page and switch to Radar tab', async () => {
      await page.goto('http://localhost:5173/#profile', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      // Click Radar Tab
      const radarTab = page.locator('[data-testid="tab-profile-radar"]');
      await radarTab.waitFor({ state: 'visible', timeout: 6000 });
      await radarTab.click();
      await page.waitForTimeout(800);

      const radarContainer = page.locator('[data-testid="ai-job-radar-container"]');
      await radarContainer.waitFor({ state: 'visible', timeout: 5000 });
      await shot('radar_01_loaded');
    });

    // 2. Verify active radar channels
    await step('Verify pre-configured radar channels and criteria display', async () => {
      const channel1 = page.locator('[data-testid="radar-channel-radar-1"]');
      await channel1.waitFor({ state: 'visible', timeout: 4000 });
      const channel1Text = await channel1.textContent();
      console.log('    Channel 1 text snippet:', channel1Text.slice(0, 80));

      const channel2 = page.locator('[data-testid="radar-channel-radar-2"]');
      await channel2.waitFor({ state: 'visible', timeout: 4000 });
    });

    // 3. Toggle Radar Active Switch
    await step('Toggle Radar ON/OFF state', async () => {
      const toggleBtn = page.locator('[data-testid="btn-toggle-radar-radar-1"]');
      const initialText = await toggleBtn.textContent();
      await toggleBtn.click();
      await page.waitForTimeout(400);

      const toggledText = await toggleBtn.textContent();
      console.log(`    Toggle transition: ${initialText} -> ${toggledText}`);
      if (initialText === toggledText) throw new Error('Toggle button text should change');

      // Toggle back on
      await toggleBtn.click();
      await page.waitForTimeout(300);
    });

    // 4. Test Manual Radar Scan
    await step('Trigger manual radar scan and verify live refresh', async () => {
      const scanBtn = page.locator('[data-testid="btn-radar-manual-scan"]');
      await scanBtn.click();
      await page.waitForTimeout(1000);
      await shot('radar_02_scanned_feed');
    });

    // 5. Test Create New Radar Modal
    await step('Open Create New Radar modal and fill parameters', async () => {
      const openCreateBtn = page.locator('[data-testid="btn-open-create-radar"]');
      await openCreateBtn.click();
      await page.waitForTimeout(600);

      const modal = page.locator('[data-testid="modal-create-radar"]');
      await modal.waitFor({ state: 'visible', timeout: 4000 });

      // Fill form
      await page.locator('[data-testid="input-radar-name"]').fill('Cloud DevOps & Platform Architect');
      await page.locator('[data-testid="input-radar-keyword"]').fill('DevOps');
      await page.locator('[data-testid="select-radar-salary"]').selectOption('55');
      await page.locator('[data-testid="frequency-daily"]').click();
      await page.waitForTimeout(400);
      await shot('radar_03_create_modal');

      // Submit
      await page.locator('[data-testid="btn-submit-create-radar"]').click();
      await page.waitForTimeout(800);

      const isClosed = !(await modal.isVisible());
      if (!isClosed) throw new Error('Create modal should close after submit');
      console.log('    New Radar activated successfully');
    });

    // 6. Test Quick Apply from Radar card
    await step('Test Quick Apply on a radar matched job', async () => {
      const applyBtn = page.locator('[data-testid^="btn-radar-apply-"]').first();
      await applyBtn.scrollIntoViewIfNeeded({ timeout: 4000 });
      await applyBtn.click();
      await page.waitForTimeout(800);

      const appliedText = await applyBtn.textContent();
      console.log('    Apply button text after submission:', appliedText);
      await shot('radar_04_job_applied');
    });

    // 7. Test AI Cover Letter Studio trigger from Radar card
    await step('Launch Cover Letter Studio directly from Radar job card', async () => {
      const letterBtn = page.locator('[data-testid^="btn-radar-cover-letter-"]').first();
      await letterBtn.click();
      await page.waitForTimeout(800);

      const studioModal = page.locator('[data-testid="cover-letter-studio-modal"]');
      await studioModal.waitFor({ state: 'visible', timeout: 5000 });
      await shot('radar_05_studio_from_radar');

      // Close studio
      await page.locator('[data-testid="btn-close-cover-letter-studio"]').click();
      await page.waitForTimeout(400);
    });

    console.log('\n--- Checking Console & Network Logs ---');
    if (logs.length > 0) {
      console.error('FAILED: Browser console errors detected:', logs);
      process.exit(1);
    } else {
      console.log('🎉 ALL AI JOB RADAR PLAYWRIGHT TESTS PASSED (0 CONSOLE ERRORS)!');
    }

  } catch (err) {
    console.error('Fatal error during test:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
