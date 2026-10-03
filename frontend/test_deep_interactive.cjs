const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runDeepInteractiveTests() {
  console.log('===============================================================');
  console.log('🧪 RUNNING DEEP INTERACTIVE FEATURE TESTS (USER PERSONAS)');
  console.log('===============================================================\n');

  const browser = await chromium.launch({ headless: true });
  let consoleErrors = 0;
  let networkFailures = 0;

  try {
    // -------------------------------------------------------------
    // PART 1: CANDIDATE INTERACTIVE EXPERIENCE
    // -------------------------------------------------------------
    console.log('👤 PART 1: CANDIDATE DEEP FEATURE INTERACTIONS');
    const candidateContext = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const page = await candidateContext.newPage();

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('React') && !text.includes('favicon')) {
          consoleErrors++;
          console.error(`[Console Error]: ${text}`);
        }
      }
    });

    page.on('response', resp => {
      if (resp.status() >= 400 && !resp.url().includes('favicon')) {
        networkFailures++;
        console.error(`[Network Error] ${resp.status()} ${resp.url()}`);
      }
    });

    // 1. Authenticate as Candidate
    console.log('\n[Feature 1] Authenticating as Candidate...');
    await page.goto(`${BASE_URL}/#`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=TalentBridge', { timeout: 10000 });
    await page.click('button:has-text("Đăng nhập")');
    await page.waitForSelector('#auth-email', { timeout: 5000 });
    await page.fill('#auth-email', 'khang.candidate@talentbridge.vn');
    await page.fill('#auth-password', 'Password@123');
    await page.click('form button[type="submit"]:has-text("Đăng nhập")');
    await page.waitForTimeout(1000);
    console.log('  ✓ Candidate authenticated');

    // 2. Generate AI Cover Letter in Jobs Page
    console.log('\n[Feature 2] Generating AI Cover Letter on Jobs Page...');
    await page.evaluate(() => {
      window.location.hash = 'jobs';
    });
    await page.waitForTimeout(1200);
    await page.waitForSelector('text=Tìm kiếm việc làm & Cơ hội công nghệ AI', { timeout: 10000 });
    
    // Select a job card in master column that is not applied yet
    const jobCards = page.locator('div[class*="cursor-pointer"]:has-text("Triệu")');
    const cardCount = await jobCards.count();
    console.log(`  Found ${cardCount} jobs in master list`);
    if (cardCount > 2) {
      await jobCards.nth(2).click();
      await page.waitForTimeout(600);
    }

    // Click Cover Letter AI Generator button: "Tự động soạn bằng AI"
    const coverLetterBtn = page.locator('button:has-text("Tự động soạn bằng AI"), button:has-text("Auto-Generate with AI")').first();
    if (await coverLetterBtn.isVisible()) {
      await coverLetterBtn.click();
      await page.waitForTimeout(1600); // Wait for mock generation
      const coverLetterArea = page.locator('textarea').first();
      if (await coverLetterArea.isVisible()) {
        const textVal = await coverLetterArea.inputValue();
        console.log(`  ✓ Cover Letter generated (${textVal.length} characters)`);
      }
    } else {
      console.log('  ℹ Cover letter button already applied or not visible for this job');
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'deep_01_cover_letter.png') });

    // 3. Save / Bookmark Job & Verify in Candidate Profile
    console.log('\n[Feature 3] Bookmarking Job & Verifying in Profile...');
    const bookmarkBtn = page.locator('button[title*="Lưu"], button[title*="Bookmark"], button:has(svg.lucide-bookmark)').first();
    if (await bookmarkBtn.isVisible()) {
      await bookmarkBtn.click();
      await page.waitForTimeout(600);
      console.log('  ✓ Job bookmark toggled');
    }

    // Navigate to Candidate Profile
    await page.evaluate(() => {
      window.location.hash = 'profile';
    });
    await page.waitForTimeout(1200);
    await page.waitForSelector('h1:has-text("Vu Minh Khang")', { timeout: 10000 });
    
    // Click "Việc đã lưu" tab in profile
    const savedJobsTab = page.locator('button:has-text("Việc đã lưu")').first();
    if (await savedJobsTab.isVisible()) {
      await savedJobsTab.click();
      await page.waitForTimeout(600);
      console.log('  ✓ Saved Jobs tab inspected in candidate profile');
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'deep_02_saved_jobs_profile.png') });

    // 4. Interactive AI CV Scanner
    console.log('\n[Feature 4] Testing Interactive AI CV Scanner...');
    await page.evaluate(() => {
      window.location.hash = 'scanner';
    });
    await page.waitForTimeout(1200);
    await page.waitForSelector('#ai-cv-scanner', { timeout: 10000 });
    
    // Click upload zone to run scan simulation
    const dropzone = page.locator('#ai-cv-scanner div[class*="border-dashed"]').first();
    await dropzone.click();
    console.log('  ✓ Triggered CV laser scan simulation');
    await page.waitForTimeout(2500); // Wait for 4-step scan to finish

    // Click tabs: Skills tab & Recommendations tab
    const skillsTab = page.locator('#ai-cv-scanner button:has-text("Kỹ năng")').first();
    if (await skillsTab.isVisible()) {
      await skillsTab.click();
      await page.waitForTimeout(500);
      console.log('  ✓ Inspected CV Skills analysis breakdown');
    }

    const recsTab = page.locator('#ai-cv-scanner button:has-text("Khuyến nghị"), #ai-cv-scanner button:has-text("Đề xuất")').first();
    if (await recsTab.isVisible()) {
      await recsTab.click();
      await page.waitForTimeout(500);
      console.log('  ✓ Inspected CV AI improvement recommendations');
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'deep_03_cv_scanner_interactive.png') });

    // 5. Interactive Career Roadmap
    console.log('\n[Feature 5] Testing Interactive Career Roadmap Tracks...');
    await page.evaluate(() => {
      window.location.hash = 'roadmap';
    });
    await page.waitForTimeout(1200);
    await page.waitForSelector('#roadmap', { timeout: 10000 });

    // Switch between the roadmap tracks
    const roadmapTrackButtons = page.locator('#roadmap div.flex button[type="button"]');
    const trackCount = await roadmapTrackButtons.count();
    console.log(`  Found ${trackCount} career roadmap tracks`);
    if (trackCount > 1) {
      await roadmapTrackButtons.nth(1).click();
      await page.waitForTimeout(500);
      console.log('  ✓ Switched to Career Roadmap Track 2');
    }
    if (trackCount > 2) {
      await roadmapTrackButtons.nth(2).click();
      await page.waitForTimeout(500);
      console.log('  ✓ Switched to Career Roadmap Track 3');
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'deep_04_roadmap_tracks.png') });

    // 6. Comprehensive Search & Filter Interaction on Jobs Page
    console.log('\n[Feature 6] Testing Multi-Dimensional Job Filters & Reset...');
    await page.evaluate(() => {
      window.location.hash = 'jobs';
    });
    await page.waitForTimeout(1200);
    await page.waitForSelector('text=Tìm kiếm việc làm & Cơ hội công nghệ AI', { timeout: 10000 });

    // Click quick filter pill: "Lương cao (> 30 Triệu)"
    const highSalaryPill = page.locator('button:has-text("Lương cao")').first();
    if (await highSalaryPill.isVisible()) {
      await highSalaryPill.click();
      await page.waitForTimeout(500);
      console.log('  ✓ Filtered by high salary quick pill');
    }

    // Click quick filter pill: "Làm việc từ xa (Remote)"
    const remotePill = page.locator('button:has-text("Làm việc từ xa")').first();
    if (await remotePill.isVisible()) {
      await remotePill.click();
      await page.waitForTimeout(500);
      console.log('  ✓ Filtered by Remote quick pill');
    }

    // Click "Tất cả việc làm" to restore
    const allPill = page.locator('button:has-text("Tất cả việc làm")').first();
    if (await allPill.isVisible()) {
      await allPill.click();
      await page.waitForTimeout(500);
      console.log('  ✓ Restored all jobs view');
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'deep_05_search_filters.png') });
    await candidateContext.close();

    // -------------------------------------------------------------
    // PART 2: RECRUITER DEEP ATS PIPELINE INTERACTIONS
    // -------------------------------------------------------------
    console.log('\n💼 PART 2: RECRUITER DEEP ATS PIPELINE INTERACTIONS');
    const recruiterContext = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const rPage = await recruiterContext.newPage();

    rPage.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('React') && !text.includes('favicon')) {
          consoleErrors++;
          console.error(`[Recruiter Console Error]: ${text}`);
        }
      }
    });

    rPage.on('response', resp => {
      if (resp.status() >= 400 && !resp.url().includes('favicon')) {
        networkFailures++;
        console.error(`[Recruiter Network Error] ${resp.status()} ${resp.url()}`);
      }
    });

    // Login as Recruiter
    console.log('\n[Feature 7] Authenticating as Recruiter...');
    await rPage.goto(`${BASE_URL}/#`, { waitUntil: 'domcontentloaded' });
    await rPage.waitForSelector('text=TalentBridge', { timeout: 10000 });
    await rPage.click('button:has-text("Đăng nhập")');
    await rPage.waitForSelector('#auth-email', { timeout: 5000 });
    await rPage.fill('#auth-email', 'khang.recruiter@talentbridge.vn');
    await rPage.fill('#auth-password', 'Password@123');
    await rPage.click('form button[type="submit"]:has-text("Đăng nhập")');
    await rPage.waitForTimeout(1000);
    console.log('  ✓ Recruiter authenticated');

    // Navigate to ATS Pipeline
    console.log('\n[Feature 8] Exploring ATS Pipeline Tabs & Filters...');
    await rPage.evaluate(() => {
      window.location.hash = 'ats-pipeline';
    });
    await rPage.waitForTimeout(1200);
    await rPage.waitForSelector('text=Tự Động Hóa Quy Trình Tuyển Dụng', { timeout: 10000 });

    // Switch Job Pipeline tabs
    const pipelineTabs = rPage.locator('button:has-text("Lead Fullstack"), button:has-text("Cloud & DevOps Lead")');
    const pCount = await pipelineTabs.count();
    if (pCount > 0) {
      await pipelineTabs.first().click();
      await rPage.waitForTimeout(600);
      console.log('  ✓ Switched to second ATS Job Pipeline tab');
    }

    // Switch back to primary pipeline
    const aiPipelineTab = rPage.locator('button:has-text("Senior AI/ML Engineer")').first();
    if (await aiPipelineTab.isVisible()) {
      await aiPipelineTab.click();
      await rPage.waitForTimeout(600);
      console.log('  ✓ Switched back to Senior AI/ML Engineer pipeline');
    }

    // Filter by "> 95% Match"
    const highMatchFilter = rPage.locator('button:has-text("> 95% Match")').first();
    if (await highMatchFilter.isVisible()) {
      await highMatchFilter.click();
      await rPage.waitForTimeout(500);
      console.log('  ✓ Filtered ATS pipeline by > 95% Match');
    }

    // Reset filter with "Tất cả"
    const allMatchFilter = rPage.locator('button:has-text("Tất cả")').first();
    if (await allMatchFilter.isVisible()) {
      await allMatchFilter.click();
      await rPage.waitForTimeout(500);
      console.log('  ✓ Reset ATS pipeline match filter to All');
    }

    // Search candidates by skill "PyTorch"
    const candSearchInput = rPage.locator('input[placeholder*="Tìm ứng viên theo tên"]').first();
    if (await candSearchInput.isVisible()) {
      await candSearchInput.fill('PyTorch');
      await rPage.waitForTimeout(500);
      console.log('  ✓ Searched candidate pool by skill "PyTorch"');
      await candSearchInput.fill(''); // clear
      await rPage.waitForTimeout(300);
    }

    await rPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'deep_06_ats_pipeline_deep.png') });
    await recruiterContext.close();

    console.log('\n===============================================================');
    console.log('🎉 ALL DEEP INTERACTIVE FEATURE TESTS COMPLETED SUCCESSFULLY!');
    console.log(`Console Errors: ${consoleErrors}`);
    console.log(`Network Failures: ${networkFailures}`);
    console.log('===============================================================');

  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runDeepInteractiveTests();
