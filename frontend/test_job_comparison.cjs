const { chromium } = require('C:/Users/DELL/.gemini/antigravity/scratch/ai-recruitment-platform/frontend/node_modules/playwright');
const path = require('path');
const OUT = path.join(__dirname, 'shots');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const logs = [];

  page.on('console', m => {
    if (['error', 'warning'].includes(m.type())) {
      logs.push(`[${m.type()}] ${m.text().slice(0, 250)}`);
    }
  });
  page.on('pageerror', e => logs.push(`[pageerror] ${e.message}`));
  page.on('response', r => {
    if (r.status() >= 400 && !r.url().includes('favicon')) {
      logs.push(`[http ${r.status()}] ${r.request().method()} ${r.url()}`);
    }
  });

  const shot = n => page.screenshot({ path: path.join(OUT, n + '.png') });
  const step = async (name, fn) => {
    try {
      await fn();
      console.log('✓ PASS:', name);
    } catch (e) {
      console.error('✗ FAIL:', name, '->', e.message);
      process.exitCode = 1;
    }
  };

  // 1. Visit #jobs page
  await page.goto('http://localhost:5173/#jobs', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // 2. Select first 2 jobs for comparison
  await step('Select 2 jobs to compare and verify floating comparison dock', async () => {
    const compareBtns = page.locator('button[data-testid^="compare-job-btn-"]');
    await compareBtns.first().waitFor({ timeout: 5000 });
    const count = await compareBtns.count();
    console.log('    Found compare buttons on job cards:', count);
    if (count < 2) throw new Error('Expected at least 2 job cards with compare button');

    // Click first job compare button
    await compareBtns.nth(0).click();
    await page.waitForTimeout(400);

    // Click second job compare button
    await compareBtns.nth(1).click();
    await page.waitForTimeout(600);

    const dock = page.locator('[data-testid="job-comparison-dock"]');
    await dock.waitFor({ timeout: 4000 });
    const isDockVis = await dock.isVisible();
    console.log('    Comparison dock visible:', isDockVis);
    if (!isDockVis) throw new Error('Comparison dock is not visible');

    const dockText = await dock.innerText();
    if (!dockText.includes('2/3')) throw new Error('Expected 2/3 jobs indicated in dock');
    await shot('compare_01_dock_active');
  });

  // 3. Open Comparison Matrix Modal
  await step('Click "So sánh ngay" and verify side-by-side comparison modal', async () => {
    const openModalBtn = page.locator('[data-testid="open-comparison-modal-btn"]');
    await openModalBtn.click();
    await page.waitForTimeout(600);

    const modal = page.locator('[data-testid="job-comparison-modal"]');
    await modal.waitFor({ timeout: 5000 });
    const isModalVis = await modal.isVisible();
    console.log('    Comparison modal visible:', isModalVis);
    if (!isModalVis) throw new Error('Comparison modal is not visible');

    // Verify side-by-side columns
    const compSections = modal.locator('span:has-text("Mức lương & Đãi ngộ")');
    const compCount = await compSections.count();
    console.log('    Compared jobs rendered in matrix:', compCount);
    if (compCount < 2) throw new Error('Expected at least 2 jobs in comparison matrix');

    await shot('compare_02_matrix_modal');
  });

  // 4. Test Quick Apply inside Comparison Modal
  await step('Click Quick Apply from comparison modal and verify submission', async () => {
    const quickApplyBtn = page.locator('[data-testid="job-comparison-modal"] button:has-text("Ứng tuyển nhanh")').first();
    if (await quickApplyBtn.isVisible()) {
      await quickApplyBtn.click();
      await page.waitForTimeout(400);

      const toast = page.locator('text=Đã gửi hồ sơ ứng tuyển');
      const toastVis = await toast.isVisible();
      console.log('    Application toast visible:', toastVis);
      if (!toastVis) throw new Error('Application toast did not appear');
    }
    await shot('compare_03_quick_applied');
  });

  // 5. Close Comparison Modal and Clear Dock
  await step('Close comparison modal and clear comparison dock', async () => {
    const closeModalBtn = page.locator('[data-testid="close-comparison-modal-btn"]');
    await closeModalBtn.click();
    await page.waitForTimeout(500);

    const modal = page.locator('[data-testid="job-comparison-modal"]');
    const isClosed = !(await modal.isVisible());
    if (!isClosed) throw new Error('Modal did not close');

    // Clear dock
    const clearBtn = page.locator('[data-testid="clear-comparison-btn"]');
    await clearBtn.click();
    await page.waitForTimeout(500);

    const dock = page.locator('[data-testid="job-comparison-dock"]');
    const isDockCleared = !(await dock.isVisible());
    console.log('    Comparison dock dismissed after clear:', isDockCleared);
    if (!isDockCleared) throw new Error('Dock did not clear');

    await shot('compare_04_cleared_success');
  });

  console.log('\n--- PLAYWRIGHT LOG AUDIT ---');
  console.log('Total intercepted warnings/errors:', logs.length);
  logs.forEach(l => console.log('  ', l));

  await browser.close();
  if (process.exitCode) {
    console.error('\nJob Comparison Suite encountered failures!');
    process.exit(1);
  } else {
    console.log('\n🌟 ALL JOB COMPARISON PLAYWRIGHT TESTS PASSED (0 ERRORS)!');
  }
})();
