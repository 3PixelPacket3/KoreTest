const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    await page.goto('http://localhost:3000/index.html');
    await page.type('#globalSearchInput', 'settings');
    await new Promise(r => setTimeout(r, 1000));
    const results = await page.evaluate(() => document.getElementById('globalSearchResults').innerHTML);
    console.log('RESULTS:', results);
    await browser.close();
})();
