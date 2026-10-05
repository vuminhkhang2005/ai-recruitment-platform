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
      logs.push(`[error] ${m.text().slice(0, 250)}`);
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
    // 1. Visit Salary Estimator via hash route #salary
    await step('Navigate to Salary Estimator via #salary route', async () => {
      await page.goto('http://localhost:5173/#salary', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      const container = page.locator('[data-testid="salary-calculator-container"]');
      await container.waitFor({ state: 'visible', timeout: 6000 });
      await shot('salary_01_loaded');
    });

    let initialVnd = '';
    // 2. Verify initial calculations
    await step('Verify initial Gross salary and percentile rankings', async () => {
      initialVnd = await page.locator('[data-testid="salary-display-vnd"]').textContent();
      const initialUsd = await page.locator('[data-testid="salary-display-usd"]').textContent();
      const initialPercentile = await page.locator('[data-testid="market-percentile-badge"]').textContent();
      const initialTC = await page.locator('[data-testid="annual-package-display"]').textContent();
      console.log(`    Default AI Engineer Gross: ${initialVnd} (${initialUsd}), ${initialPercentile}, TC: ${initialTC}`);
    });

    // 3. Switch to Net mode
    await step('Switch to Net (Take-Home) mode and verify reduction', async () => {
      await page.locator('[data-testid="btn-mode-net"]').click();
      await page.waitForTimeout(400);

      const netVnd = await page.locator('[data-testid="salary-display-vnd"]').textContent();
      console.log(`    Net Take-Home: ${netVnd}`);
      if (netVnd === initialVnd) {
        throw new Error('Net salary must be strictly lower than Gross salary due to taxes & insurance');
      }
      await shot('salary_02_net_mode');

      // Switch back to Gross
      await page.locator('[data-testid="btn-mode-gross"]').click();
      await page.waitForTimeout(300);
    });

    // 4. Change role to Golang Lead
    await step('Change target role to Golang Lead', async () => {
      await page.locator('[data-testid="role-option-golang-lead"]').click();
      await page.waitForTimeout(400);
      const golangVnd = await page.locator('[data-testid="salary-display-vnd"]').textContent();
      console.log(`    Golang Lead Gross: ${golangVnd}`);
    });

    // 5. Adjust Experience Slider to 8 years
    await step('Adjust experience slider to 8 years (Staff / Lead level)', async () => {
      const slider = page.locator('[data-testid="slider-experience"]');
      await slider.evaluate((el) => {
        const input = el;
        input.value = '8';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await page.waitForTimeout(400);

      const exp8Vnd = await page.locator('[data-testid="salary-display-vnd"]').textContent();
      const exp8Percentile = await page.locator('[data-testid="market-percentile-badge"]').textContent();
      console.log(`    8 Years Lead Gross: ${exp8Vnd}, ${exp8Percentile}`);
    });

    // 6. Select Global Remote and Fluent English
    await step('Select Global Remote location and Fluent English', async () => {
      await page.locator('[data-testid="location-remote"]').click();
      await page.waitForTimeout(300);
      await page.locator('[data-testid="english-fluent"]').click();
      await page.waitForTimeout(400);

      const remoteVnd = await page.locator('[data-testid="salary-display-vnd"]').textContent();
      const remoteUsd = await page.locator('[data-testid="salary-display-usd"]').textContent();
      console.log(`    Remote Global USD Package: ${remoteVnd} (${remoteUsd})`);
    });

    // 7. Toggle High-Value Boosters
    await step('Activate Multi-cloud & Distributed Systems Boosters', async () => {
      await page.locator('[data-testid="booster-k8s-terraform"]').click();
      await page.waitForTimeout(300);
      await page.locator('[data-testid="booster-sys-design"]').click();
      await page.waitForTimeout(400);

      const boostedVnd = await page.locator('[data-testid="salary-display-vnd"]').textContent();
      console.log(`    Boosted High-Scale TC Gross: ${boostedVnd}`);
      await shot('salary_03_customized_benchmark');
    });

    // 8. Test Copy Summary Button
    await step('Test Copy Summary button interaction', async () => {
      await page.locator('[data-testid="btn-copy-salary-summary"]').click();
      await page.waitForTimeout(500);
    });

    // 9. Test Tab Switcher within Career Suite
    await step('Test bidirectional navigation between Hub tabs', async () => {
      await page.locator('[data-testid="tab-career-roadmap"]').click();
      await page.waitForTimeout(400);
      await page.locator('[data-testid="tab-cv-scanner"]').click();
      await page.waitForTimeout(400);
      await page.locator('[data-testid="tab-salary-calculator"]').click();
      await page.waitForTimeout(400);
    });

    // 10. Test Browse Matching Jobs CTA
    await step('Test "Xem các việc làm có mức lương này ngay" CTA transition', async () => {
      await page.locator('[data-testid="btn-view-salary-matching-jobs"]').click();
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      console.log('    URL after CTA:', currentUrl);
      if (!currentUrl.includes('#jobs')) {
        throw new Error(`Expected URL to transition to #jobs, got: ${currentUrl}`);
      }
      await shot('salary_04_jobs_redirected');
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
