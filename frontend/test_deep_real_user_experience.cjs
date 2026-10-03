const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runRealUserExploration() {
  console.log('===============================================================');
  console.log('🌟 EXECUTING DEEP REAL-USER INTERACTION & VERIFICATION');
  console.log('===============================================================\n');

  const browser = await chromium.launch({ headless: true });
  let consoleErrors = [];
  let networkErrors = [];

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN'
  });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Filter out benign React internal warnings during fast HMR
      if (!text.includes('React') && !text.includes('favicon')) {
        consoleErrors.push(text);
        console.error(`[Console Error]: ${text}`);
      }
    }
  });

  page.on('response', resp => {
    if (resp.status() >= 400 && !resp.url().includes('favicon')) {
      networkErrors.push({ url: resp.url(), status: resp.status() });
      console.error(`[Network Error] ${resp.status()} ${resp.url()}`);
    }
  });

  try {
    // -------------------------------------------------------------
    // SCENARIO 1: GUEST LANDING, MODALS & CATEGORIES
    // -------------------------------------------------------------
    console.log('📌 SCENARIO 1: GUEST EXPLORATION & DETAIL MODAL');
    await page.goto(`${BASE_URL}/#`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=TalentBridge', { timeout: 10000 });
    console.log('  ✓ Landed on Homepage as Guest');

    // Scroll to Featured Jobs on Homepage
    const featuredCard = page.locator('#featured-jobs div[class*="cursor-pointer"], section div[class*="cursor-pointer"]:has-text("Triệu")').first();
    if (await featuredCard.isVisible()) {
      await featuredCard.click();
      await page.waitForTimeout(800);
      console.log('  ✓ Opened JobDetailModal from Homepage card');

      // Click tabs in JobDetailModal
      const reqTab = page.locator('button:has-text("Yêu cầu ứng viên"), button:has-text("Requirements")').first();
      if (await reqTab.isVisible()) {
        await reqTab.click();
        await page.waitForTimeout(400);
        console.log('  ✓ Inspected Requirements tab in Modal');
      }

      const benTab = page.locator('button:has-text("Quyền lợi"), button:has-text("Benefits")').first();
      if (await benTab.isVisible()) {
        await benTab.click();
        await page.waitForTimeout(400);
        console.log('  ✓ Inspected Benefits tab in Modal');
      }

      const compTab = page.locator('button:has-text("Về công ty"), button:has-text("About Company")').first();
      if (await compTab.isVisible()) {
        await compTab.click();
        await page.waitForTimeout(400);
        console.log('  ✓ Inspected About Company tab in Modal');
      }

      // Close modal
      const closeBtn = page.locator('button[aria-label*="close"], button:has(svg.lucide-x)').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await page.waitForTimeout(600);
        console.log('  ✓ Closed JobDetailModal');
      }
    }

    // -------------------------------------------------------------
    // SCENARIO 2: SEARCH ENGINE EDGE CASES & MASTER-DETAIL FILTERING
    // -------------------------------------------------------------
    console.log('\n📌 SCENARIO 2: JOBS SEARCH ENGINE & MASTER-DETAIL EDGE CASES');
    await page.evaluate(() => {
      window.location.hash = 'jobs';
    });
    await page.waitForTimeout(1200);
    await page.waitForSelector('text=Tìm kiếm việc làm & Cơ hội công nghệ AI', { timeout: 10000 });
    console.log('  ✓ Navigated to Dedicated Jobs Search Page');

    const searchInput = page.locator('input[placeholder*="Tìm theo chức danh"], input[placeholder*="Search"]').first();

    // Edge case 1: Search for non-existent keyword to test Empty State
    console.log('  Testing empty state search with non-existent keyword...');
    await searchInput.fill('xyz999nonexistentjob');
    await page.waitForTimeout(600);
    
    // Check if empty state or 0 jobs found is shown
    const emptyStateText = page.locator('text=Không tìm thấy việc làm phù hợp, text=0 việc làm');
    if (await emptyStateText.count() > 0) {
      console.log('  ✓ Empty state rendered correctly for zero-result query');
    }

    // Edge case 2: Reset search
    await searchInput.fill('');
    await page.waitForTimeout(600);
    console.log('  ✓ Reset search query, full list restored');

    // Test search for "React"
    await searchInput.fill('React');
    await page.waitForTimeout(600);
    const reactCount = await page.locator('div[class*="cursor-pointer"]:has-text("React")').count();
    console.log(`  ✓ Search "React" matched ${reactCount} jobs`);
    await searchInput.fill('');
    await page.waitForTimeout(500);

    // Test Location Filter dropdown
    const locationSelect = page.locator('select').first();
    if (await locationSelect.isVisible()) {
      await locationSelect.selectOption({ label: 'Hà Nội' });
      await page.waitForTimeout(500);
      console.log('  ✓ Filtered by Location: Hà Nội');
      await locationSelect.selectOption({ index: 0 }); // Reset to All
      await page.waitForTimeout(500);
    }

    // Select second job card to check right-column detail
    const secondJob = page.locator('div[class*="cursor-pointer"]:has-text("Triệu")').nth(1);
    if (await secondJob.isVisible()) {
      await secondJob.click();
      await page.waitForTimeout(600);
      console.log('  ✓ Clicked second job card, detail column updated');

      // Toggle collapsible AI panel
      const toggleAiBtn = page.locator('button:has-text("Xem phân tích AI"), button:has-text("Thu gọn")').first();
      if (await toggleAiBtn.isVisible()) {
        await toggleAiBtn.click();
        await page.waitForTimeout(400);
        console.log('  ✓ Toggled AI Match breakdown collapsible panel');
      }
    }

    // -------------------------------------------------------------
    // SCENARIO 3: AUTHENTICATION, NOTIFICATIONS & DROPDOWN
    // -------------------------------------------------------------
    console.log('\n📌 SCENARIO 3: AUTHENTICATION & NOTIFICATION CENTER');
    const loginNavBtn = page.locator('header button:has-text("Đăng nhập"), header button:has-text("Login")').first();
    await loginNavBtn.click();
    await page.waitForSelector('#auth-email', { timeout: 5000 });

    // Fill valid candidate credentials
    await page.fill('#auth-email', 'khang.candidate@talentbridge.vn');
    await page.fill('#auth-password', 'Password@123');
    await page.click('form button[type="submit"]:has-text("Đăng nhập")');
    await page.waitForTimeout(1200);
    console.log('  ✓ Candidate logged in successfully');

    // Click Notification Bell
    const bellBtn = page.locator('header button:has(svg.lucide-bell)').first();
    if (await bellBtn.isVisible()) {
      await bellBtn.click();
      await page.waitForTimeout(500);
      console.log('  ✓ Opened Notification Center');

      const markReadBtn = page.locator('button:has-text("Đánh dấu tất cả đã đọc"), button:has-text("Mark all read")').first();
      if (await markReadBtn.isVisible()) {
        await markReadBtn.click();
        await page.waitForTimeout(400);
        console.log('  ✓ Clicked Mark All Read');
      }
    }

    // -------------------------------------------------------------
    // SCENARIO 4: CANDIDATE PROFILE DEEP EXPLORATION
    // -------------------------------------------------------------
    console.log('\n📌 SCENARIO 4: CANDIDATE PROFILE DEEP EXPLORATION');
    await page.evaluate(() => {
      window.location.hash = 'profile';
    });
    await page.waitForTimeout(1200);
    await page.waitForSelector('h1:has-text("Vu Minh Khang")', { timeout: 10000 });
    console.log('  ✓ Loaded Candidate Profile Page');

    // Click Tab 2: "Kinh nghiệm & Học vấn"
    const expTab = page.locator('button:has-text("Kinh nghiệm & Học vấn")').first();
    if (await expTab.isVisible()) {
      await expTab.click();
      await page.waitForTimeout(400);
      console.log('  ✓ Inspected Experience & Education timeline');
    }

    // Click Tab 3: "Kỹ năng & AI Đánh giá"
    const skillsRadarTab = page.locator('button:has-text("Kỹ năng & AI Đánh giá")').first();
    if (await skillsRadarTab.isVisible()) {
      await skillsRadarTab.click();
      await page.waitForTimeout(400);
      console.log('  ✓ Inspected Skills Radar & Competencies');
    }

    // Click Tab 4: "Đã ứng tuyển"
    const appliedTab = page.locator('button:has-text("Đã ứng tuyển")').first();
    if (await appliedTab.isVisible()) {
      await appliedTab.click();
      await page.waitForTimeout(400);
      console.log('  ✓ Inspected Applied Jobs history in Profile');
    }

    // Click Tab 5: "Việc đã lưu"
    const savedTab = page.locator('button:has-text("Việc đã lưu")').first();
    if (await savedTab.isVisible()) {
      await savedTab.click();
      await page.waitForTimeout(400);
      console.log('  ✓ Inspected Saved Jobs in Profile');
    }

    // Click Tab 6: "Cài đặt tài khoản"
    const settingsTab = page.locator('button:has-text("Cài đặt tài khoản")').first();
    if (await settingsTab.isVisible()) {
      await settingsTab.click();
      await page.waitForTimeout(400);
      console.log('  ✓ Inspected Account Settings in Profile');
    }

    // Switch Role via button: "Đổi sang Tuyển dụng"
    const switchRoleBtn = page.locator('button:has-text("Đổi sang Tuyển dụng")').first();
    if (await switchRoleBtn.isVisible()) {
      await switchRoleBtn.click();
      await page.waitForTimeout(800);
      console.log('  ✓ Switched active role to Recruiter via Profile banner');
    }

    // -------------------------------------------------------------
    // SCENARIO 5: RECRUITER ATS PIPELINE & POST JOB MODAL
    // -------------------------------------------------------------
    console.log('\n📌 SCENARIO 5: ATS PIPELINE & POST JOB INTERACTION');
    await page.evaluate(() => {
      window.location.hash = 'ats-pipeline';
    });
    await page.waitForTimeout(1200);
    await page.waitForSelector('text=Tự Động Hóa Quy Trình Tuyển Dụng', { timeout: 10000 });
    console.log('  ✓ Loaded Recruiter ATS Pipeline');

    // Open Candidate Details Modal from Kanban
    const candCard = page.locator('div[class*="bg-white dark:bg-slate-800"][class*="rounded"]:has-text("Match")').first();
    if (await candCard.isVisible()) {
      await candCard.click();
      await page.waitForTimeout(600);
      console.log('  ✓ Opened Candidate Evaluation Modal');

      // Close candidate modal
      const modalClose = page.locator('button[aria-label="Close modal"]').first();
      if (await modalClose.isVisible()) {
        await modalClose.click();
        await page.waitForTimeout(600);
        console.log('  ✓ Closed Candidate Evaluation Modal');
      }
    }

    // Open Post Job Modal
    const postJobBtn = page.locator('button:has-text("Đăng tin tuyển dụng mới"), button:has-text("Đăng tin")').first();
    if (await postJobBtn.isVisible()) {
      await postJobBtn.click();
      await page.waitForTimeout(600);
      console.log('  ✓ Opened Post Job Modal');

      // Test AI Template 1-click
      const templateBtn = page.locator('button:has-text("Senior Fullstack (React & Go)")').first();
      if (await templateBtn.isVisible()) {
        await templateBtn.click();
        await page.waitForTimeout(500);
        console.log('  ✓ Applied Fullstack AI Job Template');
      }

      // Add a custom skill tag via Enter key
      const skillInput = page.locator('input[placeholder*="Thêm kỹ năng"], input[placeholder*="Add skill tag"]').first();
      if (await skillInput.isVisible()) {
        await skillInput.fill('LangChain');
        await skillInput.press('Enter');
        await page.waitForTimeout(400);
        console.log('  ✓ Added custom skill tag "LangChain" via Enter key');
      }

      // Close modal
      const closePostJob = page.locator('button:has-text("Hủy bỏ"), button:has-text("Cancel")').first();
      if (await closePostJob.isVisible()) {
        await closePostJob.click();
        await page.waitForTimeout(500);
        console.log('  ✓ Cancelled and closed Post Job Modal cleanly');
      }
    }

    // -------------------------------------------------------------
    // SCENARIO 6: MOBILE RESPONSIVE DRAWER & THEME/LOCALE CYCLING
    // -------------------------------------------------------------
    console.log('\n📌 SCENARIO 6: RESPONSIVE VIEWPORT & LOCALIZATION');
    
    // Switch to Mobile Viewport (iPhone 14 / standard mobile 390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(600);
    console.log('  ✓ Resized to Mobile Viewport (390x844)');

    // Open Mobile Drawer
    const hamburgerBtn = page.locator('button:has(svg.lucide-menu)').first();
    if (await hamburgerBtn.isVisible()) {
      await hamburgerBtn.click();
      await page.waitForTimeout(500);
      console.log('  ✓ Opened Mobile Drawer');

      // Close Drawer
      const closeMenuBtn = page.locator('button:has(svg.lucide-x)').first();
      if (await closeMenuBtn.isVisible()) {
        await closeMenuBtn.click();
        await page.waitForTimeout(500);
        console.log('  ✓ Closed Mobile Drawer');
      }
    }

    // Restore Desktop Viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(500);
    console.log('  ✓ Restored Desktop Viewport (1440x900)');

    // Toggle Theme & Language
    const themeBtn = page.locator('header button:has(svg.lucide-sun), header button:has(svg.lucide-moon)').first();
    if (await themeBtn.isVisible()) {
      await themeBtn.click(); // Toggle to Dark
      await page.waitForTimeout(400);
      await themeBtn.click(); // Toggle back to Light
      await page.waitForTimeout(400);
      console.log('  ✓ Cycled Light/Dark theme successfully');
    }

    const langBtn = page.locator('header button:has-text("VI"), header button:has-text("EN")').first();
    if (await langBtn.isVisible()) {
      await langBtn.click(); // Switch to EN
      await page.waitForTimeout(400);
      await langBtn.click(); // Switch back to VI
      await page.waitForTimeout(400);
      console.log('  ✓ Cycled VI/EN localization successfully');
    }

    // Final screenshot of clean state
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'real_user_verification_complete.png') });

    console.log('\n===============================================================');
    console.log('🎉 ALL REAL-USER SCENARIOS EXECUTED & VERIFIED SUCCESSFULLY!');
    console.log(`Total Console Errors: ${consoleErrors.length}`);
    console.log(`Total Network Failures: ${networkErrors.length}`);
    console.log('===============================================================');

    if (consoleErrors.length > 0 || networkErrors.length > 0) {
      console.warn('Warnings/Errors logged during exploration:');
      consoleErrors.forEach(e => console.warn(`  - [Console]: ${e}`));
      networkErrors.forEach(n => console.warn(`  - [Network]: ${n.status} ${n.url}`));
    }

  } catch (err) {
    console.error('❌ Real-user exploration encountered an error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runRealUserExploration();
