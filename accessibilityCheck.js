const puppeteer = require('puppeteer');
const { AxePuppeteer } = require('axe-puppeteer');

async function runAccessibilityCheck(url) {
    const browser = await puppeteer.launch({
        headless: "new", // Recommended to avoid warnings
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setBypassCSP(true);

    try {
        await page.goto(url, { waitUntil: 'networkidle0' });

        const results = await new AxePuppeteer(page).analyze();

        console.log('🔍 Accessibility Violations:');
        if (results.violations.length === 0) {
            console.log('✅ No violations found!');
        } else {
            results.violations.forEach(violation => {
                console.log(`\n❌ ${violation.id}: ${violation.description}`);
                violation.nodes.forEach(node => {
                    console.log(`   🔗 Affected HTML: ${node.html}`);
                });
            });
        }
    } catch (err) {
        console.error('🚨 Error running accessibility check:', err.message);
    }

    await browser.close();
}

// ✅ Using a working website
runAccessibilityCheck('https://leetcode.com/u/jessica16/');

