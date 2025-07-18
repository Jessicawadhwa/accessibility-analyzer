const express = require('express');
const puppeteer = require('puppeteer');
const { AxePuppeteer } = require('axe-puppeteer');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

// ✅ Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ Serve static files (CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// ✅ Render the index.ejs UI
app.get('/', (req, res) => {
  res.render('index');
});

// ✅ Accessibility check endpoint
app.post('/check', async (req, res) => {
  const url = req.body.url;
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setBypassCSP(true);

    await page.goto(url, {
      waitUntil: 'load',
      timeout: 30000 // 30 seconds timeout
    });

    await page.waitForTimeout(3000); // optional: wait for page scripts to settle

    const results = await new AxePuppeteer(page).analyze();
    res.json(results);
  } catch (error) {
    console.error("❌ Accessibility check failed:", error.message);
    res.status(500).json({ error: "Failed to analyze accessibility: " + error.message });
  } finally {
    if (browser) await browser.close();
  }
});

// ✅ Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
