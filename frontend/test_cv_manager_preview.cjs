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

  // 1. Visit #profile and login if needed
  await page.goto('http://localhost:5173/#profile', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const loginGateBtn = page.locator('main button:has-text("Đăng nhập")').first();
  if (await loginGateBtn.isVisible()) {
    await loginGateBtn.click();
    await page.fill('#auth-email', 'khang.candidate@talentbridge.vn');
    await page.fill('#auth-password', 'Password@123');
    await page.locator('button:has-text("Đăng nhập vào hệ thống")').click();
    await page.locator('h1:has-text("Vu Minh Khang"), h1:has-text("Vũ Minh Khang")').first().waitFor({ timeout: 8000 });
  }

  // 2. Verify CV versions manager card
  await step('Verify CV Versions Management card and initial documents', async () => {
    const cardTitle = page.locator('h3:has-text("Quản lý phiên bản CV & Hồ sơ ATS")').first();
    await cardTitle.waitFor({ timeout: 5000 });

    const cvItems = await page.locator('div:has-text("Vu_Minh_Khang_")').count();
    console.log('    CV versions found in list:', cvItems);
    if (cvItems < 2) throw new Error('Expected at least 2 default CV versions');

    const primaryBadge = page.locator('text=Mặc định (1-Click)').first();
    const hasPrimary = await primaryBadge.isVisible();
    console.log('    Primary 1-Click badge active:', hasPrimary);
    if (!hasPrimary) throw new Error('Primary badge not visible');
  });
  await shot('cv_01_management_list');

  // 3. Test Preview Modal with A4 Sheet & Zoom
  await step('Open In-Browser CV Document Previewer Modal and test zoom', async () => {
    const previewBtn = page.locator('button:has-text("Xem trước")').first();
    await previewBtn.click();
    await page.waitForTimeout(600);

    // Modal title verification
    const modalHeader = page.locator('div[class*="fixed"] h3:has-text(".pdf"), div[class*="fixed"] h3:has-text(".docx")').first();
    await modalHeader.waitFor({ timeout: 5000 });
    const modalCvName = await modalHeader.textContent();
    console.log('    Previewing CV:', modalCvName.trim());

    // Verify A4 Sheet rendering candidate name
    const sheetCandidateName = page.locator('div[class*="origin-top"] h2').first();
    const sheetName = await sheetCandidateName.textContent();
    console.log('    A4 Document Sheet Candidate:', sheetName.trim());

    // Test Zoom In
    const zoomInBtn = page.locator('button[title="Zoom In"]').first();
    if (await zoomInBtn.isVisible()) {
      await zoomInBtn.click();
      await page.waitForTimeout(300);
      const zoomText = await page.locator('span:has-text("%")').first().textContent();
      console.log('    Zoom level after Zoom In:', zoomText.trim());
    }
  });
  await shot('cv_02_preview_modal_sheet');

  // 4. Test Parsed ATS Sub-tab in preview modal
  await step('Switch to Parsed ATS Entities sub-tab in preview modal', async () => {
    const parsedTabBtn = page.locator('button:has-text("Bóc tách từ khóa ATS & Kỹ năng")').first();
    await parsedTabBtn.click();
    await page.waitForTimeout(400);

    const skillsCount = await page.locator('span:has(svg.lucide-check-circle-2)').count();
    console.log('    Extracted NLP skills chips count:', skillsCount);
    if (skillsCount < 3) throw new Error('Expected at least 3 extracted skills chips');

    // Close preview modal
    const closeBtn = page.locator('button[aria-label="Close CV preview"]').first();
    await closeBtn.click();
    await page.waitForTimeout(400);
  });
  await shot('cv_03_preview_modal_parsed');

  // 5. Test Changing Primary CV
  await step('Change default primary CV version', async () => {
    const setPrimaryBtn = page.locator('button:has-text("Chọn chính")').first();
    if (await setPrimaryBtn.isVisible()) {
      await setPrimaryBtn.click();
      await page.waitForTimeout(500);

      const toast = page.locator('div:has-text("Đã đặt")').first();
      const toastVisible = await toast.isVisible();
      console.log('    Set Primary Toast visible:', toastVisible);
    }
  });
  await shot('cv_04_primary_changed');

  console.log('\n===============================================================');
  console.log('🎉 CV MANAGER & PREVIEW VERIFICATION COMPLETED');
  console.log('Errors logged:', logs.filter(l => l.includes('[error]') || l.includes('[pageerror]')).length);
  logs.forEach(l => console.log(' ->', l));
  console.log('===============================================================');

  await browser.close();
})();
