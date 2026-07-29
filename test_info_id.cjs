const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    await page.goto('http://localhost:3000/info-page.html?id=dummy123');
    await new Promise(r => setTimeout(r, 1000));
    
    const id = await page.evaluate(() => cloudIdentity.userId);
    console.log("cloudIdentity.userId:", id);
    
    await browser.close();
})();
