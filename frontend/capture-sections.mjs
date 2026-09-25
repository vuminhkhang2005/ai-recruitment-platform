import { chromium } from 'playwright';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('screenshots');

async function captureSections() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

  // 1. CV Scanner section
  const cvScanner = page.locator('#ai-cv-scanner');
  await cvScanner.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await cvScanner.screenshot({
    path: path.join(SCREENSHOT_DIR, 'section-cv-scanner.png'),
  });
  console.log('Saved section-cv-scanner.png');

  // 2. Bento features section
  const bento = page.locator('#features');
  await bento.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await bento.screenshot({
    path: path.join(SCREENSHOT_DIR, 'section-bento.png'),
  });
  console.log('Saved section-bento.png');

  // 3. Featured jobs section
  const jobs = page.locator('#jobs');
  await jobs.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await jobs.screenshot({
    path: path.join(SCREENSHOT_DIR, 'section-featured-jobs.png'),
  });
  console.log('Saved section-featured-jobs.png');

  // 4. Career roadmap section
  const roadmap = page.locator('#roadmap');
  await roadmap.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await roadmap.screenshot({
    path: path.join(SCREENSHOT_DIR, 'section-roadmap.png'),
  });
  console.log('Saved section-roadmap.png');

  // 5. Employer ATS Kanban section
  const employer = page.locator('#for-employers');
  await employer.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await employer.screenshot({
    path: path.join(SCREENSHOT_DIR, 'section-employer-ats.png'),
  });
  console.log('Saved section-employer-ats.png');

  // 6. Testimonials and Footer
  const footer = page.locator('footer');
  await footer.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await footer.screenshot({
    path: path.join(SCREENSHOT_DIR, 'section-footer.png'),
  });
  console.log('Saved section-footer.png');

  // 7. Job Detail Modal with AI Cover letter
  const viewDetailBtn = page.locator('button:has-text("Chi tiết")').first();
  if (await viewDetailBtn.count() > 0) {
    await viewDetailBtn.click();
    await page.waitForTimeout(400);

    const generateLetterBtn = page.locator('button:has-text("Tự động soạn bằng AI")').first();
    if (await generateLetterBtn.count() > 0) {
      await generateLetterBtn.click();
      await page.waitForTimeout(1100);
    }

    const modal = page.locator('.fixed.inset-0.z-50 > div');
    await modal.screenshot({
      path: path.join(SCREENSHOT_DIR, 'section-job-modal-full.png'),
    });
    console.log('Saved section-job-modal-full.png');
  }

  await browser.close();
  console.log('All section screenshots captured successfully!');
}

captureSections().catch((err) => {
  console.error(err);
  process.exit(1);
});
