const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    
    await page.goto('http://localhost:3000/work.html');
    await new Promise(r => setTimeout(r, 1000));
    
    await page.goto('http://localhost:3000/product-html.html');
    await new Promise(r => setTimeout(r, 1000));
    
    console.log("Done");
    await browser.close();
})();
