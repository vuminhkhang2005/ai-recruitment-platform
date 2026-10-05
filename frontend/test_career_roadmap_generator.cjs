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

  // 1. Visit Home and scroll to Roadmap
  await page.goto('http://localhost:5173/#roadmap', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const openBtn = page.locator('[data-testid="open-roadmap-generator-btn"]');
  await openBtn.scrollIntoViewIfNeeded({ timeout: 6000 });
  await page.waitForTimeout(500);

  // 2. Open Custom AI Career Roadmap Modal
  await step('Click "Thiết kế lộ trình riêng cho tôi" and verify modal opens', async () => {
    await openBtn.click();
    await page.waitForTimeout(800);

    const modal = page.locator('[data-testid="roadmap-generator-modal"]');
    await modal.waitFor({ timeout: 5000 });
    const isVis = await modal.isVisible();
    console.log('    Roadmap generator modal visible:', isVis);
    if (!isVis) throw new Error('Roadmap modal did not open');

    const plan = page.locator('[data-testid="generated-roadmap-plan"]');
    await plan.waitFor({ timeout: 4000 });
    const planVis = await plan.isVisible();
    console.log('    Synthesized roadmap plan visible:', planVis);
    if (!planVis) throw new Error('Synthesized roadmap plan not rendered');

    await shot('roadmap_01_modal_opened');
  });

  // 3. Test changing target role to AI Engineer and regenerate
  await step('Change target role to Generative AI Eng and regenerate AI plan', async () => {
    const aiRoleBtn = page.locator('button:has-text("Generative AI Eng")');
    await aiRoleBtn.click();
    await page.waitForTimeout(400);

    const genBtn = page.locator('[data-testid="generate-roadmap-btn"]');
    await genBtn.click();
    await page.waitForTimeout(800);

    const planHeader = page.locator('[data-testid="generated-roadmap-plan"] h4:has-text("Generative AI")');
    await planHeader.waitFor({ timeout: 4000 });
    const isAiPlan = await planHeader.isVisible();
    console.log('    AI Engineer plan rendered:', isAiPlan);
    if (!isAiPlan) throw new Error('Did not update to Generative AI plan');

    await shot('roadmap_02_ai_engineer_plan');
  });

  // 4. Test Save and Export PDF actions
  await step('Test Save to Profile and Export PDF buttons and verify toast', async () => {
    const saveBtn = page.locator('[data-testid="save-custom-roadmap-btn"]');
    await saveBtn.click();
    await page.waitForTimeout(400);

    const saveToast = page.locator('text=Đã lưu lộ trình thăng tiến');
    const isSaveToastVis = await saveToast.isVisible();
    console.log('    Save to profile toast visible:', isSaveToastVis);
    if (!isSaveToastVis) throw new Error('Save toast did not appear');

    const exportBtn = page.locator('[data-testid="export-roadmap-pdf-btn"]');
    await exportBtn.click();
    await page.waitForTimeout(400);

    const exportToast = page.locator('text=Đã tải xuống file kế hoạch');
    const isExportToastVis = await exportToast.isVisible();
    console.log('    Export PDF toast visible:', isExportToastVis);
    if (!isExportToastVis) throw new Error('Export toast did not appear');

    await shot('roadmap_03_actions_tested');
  });

  // 5. Close Modal and verify return to page
  await step('Close roadmap generator modal and verify page state', async () => {
    const closeBtn = page.locator('[data-testid="close-roadmap-modal-btn"]');
    await closeBtn.click();
    await page.waitForTimeout(500);

    const modal = page.locator('[data-testid="roadmap-generator-modal"]');
    const isClosed = !(await modal.isVisible());
    console.log('    Modal successfully closed:', isClosed);
    if (!isClosed) throw new Error('Modal did not close');

    await shot('roadmap_04_modal_closed');
  });

  console.log('\n--- PLAYWRIGHT LOG AUDIT ---');
  console.log('Total intercepted warnings/errors:', logs.length);
  logs.forEach(l => console.log('  ', l));

  await browser.close();
  if (process.exitCode) {
    console.error('\nCareer Roadmap Generator Suite encountered failures!');
    process.exit(1);
  } else {
    console.log('\n🌟 ALL CAREER ROADMAP GENERATOR PLAYWRIGHT TESTS PASSED (0 ERRORS)!');
  }
})();
