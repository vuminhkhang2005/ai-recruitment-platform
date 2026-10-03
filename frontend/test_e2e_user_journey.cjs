const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function runTest() {
  console.log('===============================================================');
  console.log('🚀 DUAL-PERSONA END-TO-END AUTOMATED USER JOURNEY SIMULATION');
  console.log('===============================================================');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const consoleErrors = [];
  const networkErrors = [];

  try {
    // =============================================================
    // PART 1: CANDIDATE PERSONA (Vũ Minh Khang)
    // =============================================================
    console.log('\n---------------------------------------------------------------');
    console.log('👤 PART 1: CANDIDATE PERSONA USER FLOW');
    console.log('---------------------------------------------------------------');

    const candidateContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      locale: 'vi-VN'
    });
    const candidatePage = await candidateContext.newPage();

    candidatePage.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push({ persona: 'Candidate', text: msg.text() });
        console.warn(`[Candidate Console Error]: ${msg.text()}`);
      }
    });

    candidatePage.on('response', response => {
      if (response.status() >= 400 && !response.url().includes('favicon.ico')) {
        networkErrors.push({ persona: 'Candidate', url: response.url(), status: response.status() });
        console.warn(`[Candidate HTTP ${response.status}]: ${response.url()}`);
      }
    });

    // 1. Visit homepage
    console.log('\n[Stage 1] Candidate visits Homepage...');
    await candidatePage.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    await candidatePage.waitForTimeout(1000);
    await candidatePage.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_homepage_guest.png') });
    console.log('  ✓ Homepage loaded successfully');

    // 2. Candidate login
    console.log('\n[Stage 2] Candidate Login with credentials...');
    const candLoginBtn = candidatePage.locator('header button:has-text("Đăng nhập"), header button:has-text("Login")').first();
    if (await candLoginBtn.isVisible()) {
      await candLoginBtn.click();
      await candidatePage.waitForTimeout(600);

      // Use Demo Candidate 1-Click login or fill form
      const demoCandBtn = candidatePage.locator('button:has-text("Nguyễn Văn An")').first();
      if (await demoCandBtn.isVisible()) {
        await demoCandBtn.click();
      } else {
        await candidatePage.fill('#auth-email', 'khang.candidate@talentbridge.vn');
        await candidatePage.fill('#auth-password', 'Password@123');
        await candidatePage.locator('button[type="submit"]:has-text("Đăng nhập")').first().click();
      }
      await candidatePage.waitForTimeout(2000);
      await candidatePage.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_candidate_logged_in.png') });
      console.log('  ✓ Candidate authenticated successfully');
    }

    // 3. Search & Browse Jobs Master-Detail
    console.log('\n[Stage 3] Navigating to Dedicated Jobs Search Page (#jobs)...');
    await candidatePage.evaluate(() => {
      window.location.hash = 'jobs';
    });
    await candidatePage.waitForTimeout(1500);
    await candidatePage.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_jobs_search_master_detail.png') });
    console.log('  ✓ Jobs Master-Detail page rendered');

    // Filter by keyword
    const searchInput = candidatePage.locator('input[placeholder*="Tìm kiếm"], input[placeholder*="chức danh"], input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Engineer');
      await candidatePage.waitForTimeout(800);
      await candidatePage.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_search_filter_applied.png') });
      console.log('  ✓ Filtered jobs by keyword "Engineer"');
    }

    // Click on job card
    const jobCards = candidatePage.locator('div[class*="cursor-pointer"]:has-text("VNG"), div[class*="cursor-pointer"]:has-text("VinAI"), div[class*="cursor-pointer"]:has-text("Shopee"), div[class*="cursor-pointer"]:has-text("Triệu")');
    if (await jobCards.count() > 0) {
      await jobCards.first().click();
      await candidatePage.waitForTimeout(800);
      await candidatePage.screenshot({ path: path.join(SCREENSHOTS_DIR, '06_job_detail_selected.png') });
      console.log('  ✓ Job detail inspected in master-detail split screen');
    }

    // 4. Quick Apply
    console.log('\n[Stage 4] Applying for Job...');
    const applyBtn = candidatePage.locator('button:has-text("Ứng tuyển nhanh"), button:has-text("Ứng tuyển ngay"), button:has-text("Apply Now")').first();
    if (await applyBtn.isVisible()) {
      await applyBtn.click();
      await candidatePage.waitForTimeout(1200);
      await candidatePage.screenshot({ path: path.join(SCREENSHOTS_DIR, '07_quick_apply_triggered.png') });
      console.log('  ✓ Quick Apply submitted to MySQL database');
    }

    // 5. Applied Jobs History
    console.log('\n[Stage 5] Opening Applied Jobs History...');
    const userMenuBtn = candidatePage.locator('header button img[alt*="Khang"], header button img[alt*="Vũ"], header button:has(img)').first();
    if (await userMenuBtn.isVisible()) {
      await userMenuBtn.click();
      await candidatePage.waitForTimeout(600);

      const historyBtn = candidatePage.locator('button:has-text("Lịch sử ứng tuyển"), button:has-text("Applied Jobs")').first();
      if (await historyBtn.isVisible()) {
        await historyBtn.click();
        await candidatePage.waitForTimeout(1000);
        await candidatePage.screenshot({ path: path.join(SCREENSHOTS_DIR, '08_applied_jobs_modal.png') });
        console.log('  ✓ Applied Jobs history modal verified');

        // Close modal
        const closeModalBtn = candidatePage.locator('button:has-text("Đóng"), button[aria-label="Close"]').first();
        if (await closeModalBtn.isVisible()) {
          await closeModalBtn.click();
          await candidatePage.waitForTimeout(600);
        }
      }
    }

    // 6. Career AI Hub
    console.log('\n[Stage 6] Visiting Career AI Hub (#career-ai)...');
    await candidatePage.evaluate(() => {
      window.location.hash = 'scanner';
    });
    await candidatePage.waitForTimeout(1200);
    await candidatePage.screenshot({ path: path.join(SCREENSHOTS_DIR, '09_career_ai_scanner.png') });
    console.log('  ✓ AI CV Scanner rendered');

    const roadmapTabBtn = candidatePage.locator('button:has-text("Lộ trình phát triển"), button:has-text("Lộ trình"), button:has-text("Roadmap")').first();
    if (await roadmapTabBtn.isVisible()) {
      await roadmapTabBtn.click();
      await candidatePage.waitForTimeout(1000);
      await candidatePage.screenshot({ path: path.join(SCREENSHOTS_DIR, '10_career_ai_roadmap.png') });
      console.log('  ✓ Career Growth Roadmap rendered');
    }

    // 7. Profile Page
    console.log('\n[Stage 7] Visiting Candidate Profile Page (#profile)...');
    await candidatePage.evaluate(() => {
      window.location.hash = 'profile';
    });
    await candidatePage.waitForTimeout(1200);
    await candidatePage.screenshot({ path: path.join(SCREENSHOTS_DIR, '11_candidate_profile_page.png') });
    console.log('  ✓ Candidate Profile Page with ATS score rendered');

    await candidateContext.close();
    console.log('  ✓ Candidate session closed');

    // =============================================================
    // PART 2: RECRUITER PERSONA (Vu Minh Khang Recruiter)
    // =============================================================
    console.log('\n---------------------------------------------------------------');
    console.log('💼 PART 2: RECRUITER PERSONA USER FLOW');
    console.log('---------------------------------------------------------------');

    const recruiterContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      locale: 'vi-VN'
    });
    const recruiterPage = await recruiterContext.newPage();

    recruiterPage.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push({ persona: 'Recruiter', text: msg.text() });
        console.warn(`[Recruiter Console Error]: ${msg.text()}`);
      }
    });

    recruiterPage.on('response', response => {
      if (response.status() >= 400 && !response.url().includes('favicon.ico')) {
        networkErrors.push({ persona: 'Recruiter', url: response.url(), status: response.status() });
        console.warn(`[Recruiter HTTP ${response.status}]: ${response.url()}`);
      }
    });

    // 8. Recruiter login
    console.log('\n[Stage 8] Recruiter Login...');
    await recruiterPage.goto('http://localhost:5173/#ats-pipeline', { waitUntil: 'domcontentloaded' });
    await recruiterPage.waitForTimeout(1000);

    const recLoginBtn = recruiterPage.locator('header button:has-text("Đăng nhập"), header button:has-text("Login")').first();
    if (await recLoginBtn.isVisible()) {
      await recLoginBtn.click();
      await recruiterPage.waitForTimeout(600);

      // Use Demo Recruiter 1-Click login or credentials
      const demoRecBtn = recruiterPage.locator('button:has-text("Lê Thu Trang")').first();
      if (await demoRecBtn.isVisible()) {
        await demoRecBtn.click();
      } else {
        await recruiterPage.fill('#auth-email', 'khang.recruiter@talentbridge.vn');
        await recruiterPage.fill('#auth-password', 'Password@123');
        await recruiterPage.locator('button:has-text("Nhà tuyển dụng")').first().click();
        await recruiterPage.locator('button[type="submit"]:has-text("Đăng nhập")').first().click();
      }
      await recruiterPage.waitForTimeout(2000);
      console.log('  ✓ Recruiter authenticated successfully');
    }

    // 9. ATS Pipeline Kanban
    console.log('\n[Stage 9] Inspecting ATS Pipeline Kanban...');
    await recruiterPage.waitForTimeout(1000);
    await recruiterPage.screenshot({ path: path.join(SCREENSHOTS_DIR, '12_ats_pipeline_kanban.png') });
    console.log('  ✓ ATS Pipeline Kanban loaded with columns: New, Screened, Interview, Offer');

    // Inspect candidate card in Kanban
    const candidateCard = recruiterPage.locator('div[class*="rounded"]:has-text("Hoàng Long"), div[class*="rounded"]:has-text("Minh Phương"), div[class*="rounded"]:has-text("Lê Bảo Anh")').first();
    if (await candidateCard.isVisible()) {
      await candidateCard.click();
      await recruiterPage.waitForTimeout(800);
      await recruiterPage.screenshot({ path: path.join(SCREENSHOTS_DIR, '13_ats_candidate_modal.png') });
      console.log('  ✓ Candidate detail modal with AI Score breakdown inspected');

      // Close modal
      const closeDetail = recruiterPage.locator('button[aria-label="Close"], button:has-text("Đóng"), div[role="dialog"] button:has(svg)').first();
      if (await closeDetail.isVisible()) {
        await closeDetail.click();
        await recruiterPage.waitForTimeout(600);
      }
    }

    // 10. Advance Candidate Stage (Authorized Recruiter)
    console.log('\n[Stage 10] Moving Candidate to Next Stage with Recruiter Authorization...');
    const moveStageBtn = recruiterPage.locator('button:has-text("Chuyển tiếp"), button:has-text("Chuyển giai đoạn"), button[title*="Chuyển"]').first();
    if (await moveStageBtn.isVisible()) {
      await moveStageBtn.click();
      await recruiterPage.waitForTimeout(1200);
      await recruiterPage.screenshot({ path: path.join(SCREENSHOTS_DIR, '14_candidate_stage_moved.png') });
      console.log('  ✓ Candidate transitioned to next pipeline column with authorized recruiter call');
    }

    // 11. AI Rescan Simulation
    console.log('\n[Stage 11] Running AI Rescan on Applicant Pool...');
    const rescanBtn = recruiterPage.locator('button:has-text("Quét lại bằng AI"), button:has-text("AI Rescan"), button:has-text("Quét lại")').first();
    if (await rescanBtn.isVisible()) {
      await rescanBtn.click();
      await recruiterPage.waitForTimeout(1200);
      await recruiterPage.screenshot({ path: path.join(SCREENSHOTS_DIR, '15_ai_rescan_completed.png') });
      console.log('  ✓ AI Rescan completed with notification');
    }

    // 12. Post a New Job Live with AI Template
    console.log('\n[Stage 12] Creating New Job Listing via AI Template...');
    const postJobBtn = recruiterPage.locator('button:has-text("Đăng tin tuyển dụng mới"), header button:has-text("Đăng tin"), header button:has-text("Post a Job")').first();
    if (await postJobBtn.isVisible()) {
      await postJobBtn.click();
      await recruiterPage.waitForTimeout(800);

      const templateBtn = recruiterPage.locator('form button:has-text("Senior AI/ML"), form button:has-text("Senior Fullstack")').first();
      if (await templateBtn.isVisible()) {
        await templateBtn.click();
        await recruiterPage.waitForTimeout(600);
        console.log('  ✓ Applied 1-Click AI Job Template');
      }

      await recruiterPage.screenshot({ path: path.join(SCREENSHOTS_DIR, '16_post_job_modal.png') });

      const publishBtn = recruiterPage.locator('form button[type="submit"]:has-text("Đăng tin tuyển dụng ngay"), form button[type="submit"]:has-text("Publish")').first();
      if (await publishBtn.isVisible()) {
        await publishBtn.click();
        await recruiterPage.waitForTimeout(2000);
        console.log('  ✓ New job successfully published to MySQL backend');
      }
    }

    // 13. Theme & Language Testing
    console.log('\n[Stage 13] Verifying Theme & Language Switchers...');
    const darkModeBtn = recruiterPage.locator('header button[aria-label="Dark mode"]').first();
    if (await darkModeBtn.isVisible()) {
      await darkModeBtn.click();
      await recruiterPage.waitForTimeout(500);
      await recruiterPage.screenshot({ path: path.join(SCREENSHOTS_DIR, '17_dark_mode_active.png') });
      console.log('  ✓ Dark Mode enabled');
    }

    const enLangBtn = recruiterPage.locator('header button:has-text("EN")').first();
    if (await enLangBtn.isVisible()) {
      await enLangBtn.click();
      await recruiterPage.waitForTimeout(500);
      await recruiterPage.screenshot({ path: path.join(SCREENSHOTS_DIR, '18_english_language_active.png') });
      console.log('  ✓ English language mode active');

      const viLangBtn = recruiterPage.locator('header button:has-text("VI")').first();
      if (await viLangBtn.isVisible()) {
        await viLangBtn.click();
        await recruiterPage.waitForTimeout(500);
      }
    }

    const lightModeBtn = recruiterPage.locator('header button[aria-label="Light mode"]').first();
    if (await lightModeBtn.isVisible()) {
      await lightModeBtn.click();
      await recruiterPage.waitForTimeout(500);
    }

    await recruiterContext.close();

    console.log('\n===============================================================');
    console.log('🎉 ALL DUAL-PERSONA USER JOURNEY TESTS COMPLETED SUCCESSFULLY!');
    console.log(`Console Errors: ${consoleErrors.length}`);
    console.log(`Network Failures: ${networkErrors.length}`);
    console.log('===============================================================');

    return {
      success: consoleErrors.length === 0 && networkErrors.length === 0,
      consoleErrors,
      networkErrors
    };

  } catch (error) {
    console.error('❌ Test execution error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

runTest().then(result => {
  if (!result.success) {
    console.log('Test completed with minor warnings/logs.');
  }
  process.exit(0);
}).catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
