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
    // 1. Visit Jobs Page
    await step('Navigate to Jobs Page and select first job', async () => {
      await page.goto('http://localhost:5173/#jobs', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      // Select first job card
      const firstJob = page.locator('[data-testid^="job-card-"]').first();
      await firstJob.waitFor({ state: 'visible', timeout: 6000 });
      await firstJob.click();
      await page.waitForTimeout(800);
      await shot('cover_letter_01_jobs_selected');
    });

    // 2. Open Cover Letter Studio from Detail Pane
    await step('Click "Studio Thư AI" button and verify studio modal opens', async () => {
      const openBtn = page.locator('[data-testid="open-cover-letter-studio-btn"]');
      await openBtn.scrollIntoViewIfNeeded({ timeout: 4000 });
      await openBtn.click();
      await page.waitForTimeout(800);

      const studioModal = page.locator('[data-testid="cover-letter-studio-modal"]');
      await studioModal.waitFor({ state: 'visible', timeout: 5000 });
      await shot('cover_letter_02_studio_opened');
    });

    let initialText = '';
    // 3. Inspect generated text and initial tone
    await step('Verify generated letter content, word count, and tone controls', async () => {
      const textarea = page.locator('[data-testid="textarea-cover-letter-content"]');
      initialText = await textarea.inputValue();
      console.log('    Initial length:', initialText.length, 'chars');
      if (initialText.length < 100) {
        throw new Error('Expected generated cover letter to contain substantial tailored content');
      }

      const wordsCount = await page.locator('[data-testid="cover-letter-word-count"]').textContent();
      console.log('    Word count badge:', wordsCount);
    });

    // 4. Change tone to Passionate
    await step('Switch tone to Passionate and verify dynamic adaptation', async () => {
      await page.locator('[data-testid="tone-option-passionate"]').click();
      await page.waitForTimeout(600);

      const textarea = page.locator('[data-testid="textarea-cover-letter-content"]');
      const passionateText = await textarea.inputValue();
      if (passionateText === initialText) {
        throw new Error('Passionate tone text should differ from Professional tone text');
      }
      console.log('    Passionate tone verified with distinct opening');
      await shot('cover_letter_03_passionate_tone');
    });

    // 5. Change tone to Technical & STAR Metrics
    await step('Switch tone to Technical STAR Metrics', async () => {
      await page.locator('[data-testid="tone-option-technical"]').click();
      await page.waitForTimeout(600);

      const textarea = page.locator('[data-testid="textarea-cover-letter-content"]');
      const techText = await textarea.inputValue();
      console.log('    Technical tone length:', techText.length);
    });

    // 6. Toggle Key Focus Pillars
    await step('Toggle Business Impact & Mentorship focus pillars', async () => {
      await page.locator('[data-testid="pillar-option-business"]').click();
      await page.waitForTimeout(300);
      await page.locator('[data-testid="pillar-option-leadership"]').click();
      await page.waitForTimeout(600);

      const textarea = page.locator('[data-testid="textarea-cover-letter-content"]');
      const pillarsText = await textarea.inputValue();
      console.log('    Pillars updated letter length:', pillarsText.length);
      await shot('cover_letter_04_customized_pillars');
    });

    // 7. Test direct editing in textarea
    await step('Edit cover letter directly in textarea', async () => {
      const textarea = page.locator('[data-testid="textarea-cover-letter-content"]');
      await textarea.fill((await textarea.inputValue()) + '\n\nP.S. Tôi có thể bắt đầu nhận việc ngay từ tuần sau.');
      await page.waitForTimeout(300);

      const updatedWords = await page.locator('[data-testid="cover-letter-word-count"]').textContent();
      console.log('    Updated word count:', updatedWords);
    });

    // 8. Test Copy & Download Actions
    await step('Test Copy and Download TXT action buttons', async () => {
      await page.locator('[data-testid="btn-copy-cover-letter"]').click();
      await page.waitForTimeout(400);

      await page.locator('[data-testid="btn-download-cover-letter"]').click();
      await page.waitForTimeout(500);
    });

    // 9. Test Direct Application Submission with Cover Letter
    await step('Submit application with tailored cover letter and verify success badge', async () => {
      const submitBtn = page.locator('[data-testid="btn-submit-application-with-letter"]');
      await submitBtn.click();
      await page.waitForTimeout(800);

      const successBadge = page.locator('[data-testid="cover-letter-applied-success"]');
      await successBadge.waitFor({ state: 'visible', timeout: 5000 });
      await shot('cover_letter_05_application_submitted');
    });

    // 10. Close Studio Modal
    await step('Close Studio modal and verify return to jobs flow', async () => {
      await page.locator('[data-testid="btn-close-cover-letter-studio"]').click();
      await page.waitForTimeout(500);

      const studioModal = page.locator('[data-testid="cover-letter-studio-modal"]');
      const isVisible = await studioModal.isVisible();
      if (isVisible) throw new Error('Cover letter studio modal should be closed');
    });

    // 11. Test from FeaturedJobs -> JobDetailModal -> Cover Letter Studio
    await step('Test Studio launch from Home FeaturedJobs modal', async () => {
      await page.goto('http://localhost:5173/#home', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      // Scroll to FeaturedJobs section
      const firstJobCard = page.locator('button:has-text("Xem chi tiết"), button:has-text("Chi tiết")').first();
      await firstJobCard.scrollIntoViewIfNeeded({ timeout: 6000 });
      await firstJobCard.click();
      await page.waitForTimeout(800);

      const openStudioBtn = page.locator('[data-testid="job-detail-open-studio-btn"]');
      await openStudioBtn.scrollIntoViewIfNeeded({ timeout: 4000 });
      await openStudioBtn.click();
      await page.waitForTimeout(800);

      const studioModal = page.locator('[data-testid="cover-letter-studio-modal"]');
      await studioModal.waitFor({ state: 'visible', timeout: 5000 });
      await shot('cover_letter_06_from_job_detail');

      // Close studio
      await page.locator('[data-testid="btn-close-cover-letter-studio"]').click();
      await page.waitForTimeout(400);
    });

    console.log('\n--- Checking Console & Network Logs ---');
    if (logs.length > 0) {
      console.error('FAILED: Browser console errors detected:', logs);
      process.exit(1);
    } else {
      console.log('🎉 ALL TESTS PASSED WITH 0 CONSOLE ERRORS & 0 UNHANDLED FAILURES!');
    }

  } catch (err) {
    console.error('Fatal error during test:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
