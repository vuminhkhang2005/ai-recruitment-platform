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

  await page.goto('http://localhost:5173/#ats-pipeline', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // 1. Verify Kanban loaded
  await step('ATS Kanban loaded with 4 stages', async () => {
    await page.locator('text=Tự Động Hóa Quy Trình Tuyển Dụng').waitFor({ timeout: 5000 });
    const colCount = await page.locator('h4:has-text("Ứng tuyển mới"), h4:has-text("Đã qua sàng lọc AI"), h4:has-text("Phỏng vấn kỹ thuật"), h4:has-text("Đã gửi Offer")').count();
    console.log('    Kanban headers detected:', colCount);
    if (colCount < 4) throw new Error('Expected 4 Kanban columns');
  });

  // 2. Perform HTML5 Drag and Drop from "new" column to "interview" column
  await step('Drag and drop candidate from "Ứng tuyển mới" to "Phỏng vấn kỹ thuật"', async () => {
    const newCol = page.locator('div[class*="rounded-2xl"]:has(h4:has-text("Ứng tuyển mới"))').first();
    const interviewCol = page.locator('div[class*="rounded-2xl"]:has(h4:has-text("Phỏng vấn kỹ thuật"))').first();

    const candidateCard = newCol.locator('div[draggable="true"]').first();
    const candidateName = (await candidateCard.locator('h5').first().textContent()).trim();
    console.log('    Dragging candidate:', candidateName);

    // Initial count in newCol
    const initialNewCount = await newCol.locator('div[draggable="true"]').count();
    const initialInterviewCount = await interviewCol.locator('div[draggable="true"]').count();
    console.log(`    Before drag: New=${initialNewCount}, Interview=${initialInterviewCount}`);

    // Drag to interview column
    await candidateCard.dragTo(interviewCol);
    await page.waitForTimeout(1000);

    // After count
    const afterNewCount = await newCol.locator('div[draggable="true"]').count();
    const afterInterviewCount = await interviewCol.locator('div[draggable="true"]').count();
    console.log(`    After drag: New=${afterNewCount}, Interview=${afterInterviewCount}`);

    if (afterNewCount !== initialNewCount - 1 || afterInterviewCount !== initialInterviewCount + 1) {
      throw new Error(`Count mismatch after drag: New=${afterNewCount}, Interview=${afterInterviewCount}`);
    }

    // Verify candidate is now inside interview column
    const movedCandidate = interviewCol.locator(`h5:has-text("${candidateName}")`).first();
    const isInsideInterview = await movedCandidate.isVisible();
    console.log('    Candidate verified inside Interview column:', isInsideInterview);
    if (!isInsideInterview) throw new Error('Candidate card not found in Interview column');
  });
  await shot('ats_01_drag_drop_success');

  // 3. Test modal candidate detail still works after drag
  await step('Open candidate modal from newly moved column', async () => {
    const interviewCol = page.locator('div[class*="rounded-2xl"]:has(h4:has-text("Phỏng vấn kỹ thuật"))').first();
    await interviewCol.locator('div[draggable="true"]').first().click();
    await page.waitForTimeout(600);

    const modalTitle = page.locator('div[class*="fixed"] h3').first();
    await modalTitle.waitFor({ timeout: 5000 });
    const modalName = await modalTitle.textContent();
    console.log('    Candidate modal successfully opened for:', modalName.trim());

    // Close modal
    const closeBtn = page.locator('div[class*="fixed"] button:has(svg.lucide-x)').first();
    await closeBtn.click();
    await page.waitForTimeout(400);
  });
  await shot('ats_02_candidate_modal');

  console.log('\n===============================================================');
  console.log('🎉 ATS DRAG AND DROP VERIFICATION COMPLETED');
  console.log('Errors logged:', logs.filter(l => l.includes('[error]') || l.includes('[pageerror]')).length);
  logs.forEach(l => console.log(' ->', l));
  console.log('===============================================================');

  await browser.close();
})();
