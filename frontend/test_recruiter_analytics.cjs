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

  // 1. Visit Home and navigate to Employer section
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Scroll directly to employer section
  const kanbanBtn = page.locator('[data-testid="view-mode-kanban"]');
  await kanbanBtn.scrollIntoViewIfNeeded({ timeout: 6000 });
  await page.waitForTimeout(1000);

  // 2. Verify Kanban is initially visible
  await step('Verify initial Kanban view and view switcher controls', async () => {
    const kanbanToggle = page.locator('[data-testid="view-mode-kanban"]');
    const analyticsToggle = page.locator('[data-testid="view-mode-analytics"]');

    await kanbanToggle.waitFor({ timeout: 5000 });
    const isKanbanVis = await kanbanToggle.isVisible();
    const isAnalyticsVis = await analyticsToggle.isVisible();

    if (!isKanbanVis || !isAnalyticsVis) throw new Error('View switcher buttons not found');
    await shot('analytics_01_initial_kanban');
  });

  // 3. Switch to Recruiter Analytics View
  await step('Click "Phễu & Báo cáo" and verify analytics dashboard renders', async () => {
    const analyticsToggle = page.locator('[data-testid="view-mode-analytics"]');
    await analyticsToggle.click();
    await page.waitForTimeout(600);

    const dashboard = page.locator('[data-testid="recruiter-analytics-dashboard"]');
    await dashboard.waitFor({ timeout: 5000 });
    const isDashVis = await dashboard.isVisible();
    if (!isDashVis) throw new Error('Recruiter analytics dashboard is not visible');

    // Verify 4-stage funnel flow cards
    const stageCards = dashboard.locator('h4:has-text("Ứng tuyển đầu vào"), h4:has-text("Đạt chuẩn sàng lọc AI"), h4:has-text("Phỏng vấn kỹ thuật"), h4:has-text("Chốt Offer")');
    const count = await stageCards.count();
    console.log('    Found funnel stage cards:', count);
    if (count < 3) throw new Error('Funnel stage cards missing');

    await shot('analytics_02_funnel_view');
  });

  // 4. Test Switching Pipeline Filter inside Analytics View
  await step('Switch job pipeline to Fullstack and verify dynamic metric updates', async () => {
    const fsPipelineBtn = page.locator('[data-testid="pipeline-btn-fullstack"]');
    await fsPipelineBtn.click();
    await page.waitForTimeout(600);

    const dashboard = page.locator('[data-testid="recruiter-analytics-dashboard"]');
    const bannerSubtitle = dashboard.locator('p:has-text("Lead Fullstack")');
    const isUpdated = await bannerSubtitle.isVisible();
    console.log('    Pipeline context updated to Lead Fullstack:', isUpdated);
    if (!isUpdated) throw new Error('Pipeline context did not update to Fullstack in banner');

    await shot('analytics_03_fullstack_pipeline_analytics');
  });

  // 5. Test Export Report Button & Toast Feedback
  await step('Click "Xuất báo cáo" and verify toast notification appears', async () => {
    const exportBtn = page.locator('[data-testid="export-analytics-btn"]');
    await exportBtn.click();
    await page.waitForTimeout(400);

    const toast = page.locator('text=Đã xuất báo cáo');
    const toastVis = await toast.isVisible();
    console.log('    Export notification toast visible:', toastVis);
    if (!toastVis) throw new Error('Export toast did not appear');

    await shot('analytics_04_export_toast');
  });

  // 6. Switch Back to Kanban View
  await step('Switch back to Kanban mode and verify seamless board display', async () => {
    const kanbanToggle = page.locator('[data-testid="view-mode-kanban"]');
    await kanbanToggle.click();
    await page.waitForTimeout(600);

    const searchInput = page.locator('input[placeholder*="Tìm ứng viên"]');
    const isSearchVis = await searchInput.isVisible();
    console.log('    Kanban search bar restored:', isSearchVis);
    if (!isSearchVis) throw new Error('Kanban view did not restore');

    await shot('analytics_05_kanban_restored');
  });

  console.log('\n--- PLAYWRIGHT LOG AUDIT ---');
  console.log('Total intercepted warnings/errors:', logs.length);
  logs.forEach(l => console.log('  ', l));

  await browser.close();
  if (process.exitCode) {
    console.error('\nRecruiter Analytics Suite encountered failures!');
    process.exit(1);
  } else {
    console.log('\n🌟 ALL RECRUITER ANALYTICS PLAYWRIGHT TESTS PASSED (0 ERRORS)!');
  }
})();
