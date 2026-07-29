const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    await page.goto('http://localhost:3000/info-hub.html');
    await new Promise(r => setTimeout(r, 1000));
    
    const pages = await page.evaluate(() => masterPagesList);
    console.log("Pages remaining:", pages.length);
    
    await browser.close();
})();
