const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testOfferNegotiation() {
  const OUT = path.join(__dirname, 'shots');
  const ARTIFACT_OUT = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\9c817057-d548-404f-95a2-714d44394a10\\screenshots';
  [OUT, ARTIFACT_OUT].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  console.log('[Test] Launching Chromium browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['clipboard-read', 'clipboard-write']
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('400') && !text.includes('401') && !text.includes('favicon.ico')) {
        consoleErrors.push(text);
      }
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  const shot = async (name) => {
    await page.screenshot({ path: path.join(OUT, name + '.png') });
    await page.screenshot({ path: path.join(ARTIFACT_OUT, name + '.png') });
  };

  try {
    console.log('[Test] Navigating to Career AI Hub http://localhost:5173/#negotiation...');
    await page.goto('http://localhost:5173/#negotiation', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);

    // 1. Verify Offer Negotiation tab is active or click it
    const tabBtn = page.locator('[data-testid="tab-offer-negotiation"]');
    await tabBtn.waitFor({ state: 'visible', timeout: 6000 });
    await tabBtn.click();
    await page.waitForTimeout(600);

    // 2. Verify Offer Negotiation Studio is rendered
    const studio = page.locator('[data-testid="offer-negotiation-studio"]');
    await studio.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[Test] Offer Negotiation Studio rendered successfully!');
    await shot('offer_01_loaded');

    // 3. Update current and new offer inputs
    const currentBaseInput = page.locator('[data-testid="input-current-base"]');
    await currentBaseInput.fill('45000000');

    const newBaseInput = page.locator('[data-testid="input-new-base"]');
    await newBaseInput.fill('70000000');
    await page.waitForTimeout(400);
    console.log('[Test] Filled updated base salaries for Current and New Offer.');
    await shot('offer_02_recalculated');

    // 4. Test Switching Negotiation Strategies
    const compToneBtn = page.locator('[data-testid="tone-btn-competitive"]');
    await compToneBtn.click();
    await page.waitForTimeout(400);
    console.log('[Test] Switched to Competing Offer strategy.');
    await shot('offer_03_competing_tone');

    const benefitsToneBtn = page.locator('[data-testid="tone-btn-benefits"]');
    await benefitsToneBtn.click();
    await page.waitForTimeout(400);
    console.log('[Test] Switched to WFH & Benefits negotiation strategy.');
    await shot('offer_04_benefits_tone');

    // 5. Test Copy Script button
    const copyBtn = page.locator('[data-testid="btn-copy-counter-script"]');
    await copyBtn.click();
    await page.waitForTimeout(300);
    console.log('[Test] Clicked Copy Counter-Offer Script button.');

    const scriptPreview = page.locator('[data-testid="counter-script-preview"]');
    const scriptText = await scriptPreview.innerText();
    console.log('[Test] Generated Script preview length:', scriptText.length, 'characters.');

    console.log('\n--- VERIFICATION RESULT ---');
    console.log('Console Errors:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(err => console.error('  ->', err));
      throw new Error(`Failed with ${consoleErrors.length} console errors.`);
    }

    console.log('SUCCESS: AI Offer Negotiation & Package Evaluator Studio verified with 0 console errors!');
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testOfferNegotiation();
