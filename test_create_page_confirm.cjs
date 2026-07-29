const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    
    await page.goto('http://localhost:3000/create-page.html');
    await new Promise(r => setTimeout(r, 1000));
    
    await page.evaluate(() => {
        document.getElementById('insertTemplateBtn').click();
    });
    
    await new Promise(r => setTimeout(r, 500));
    
    const uiConfirmDisplay = await page.evaluate(() => {
        const overlay = document.querySelector('div[style*="z-index: 99999"]');
        return overlay ? overlay.style.display : null;
    });
    console.log("UI Confirm Overlay Style:", uiConfirmDisplay);
    
    await page.evaluate(() => {
        document.getElementById('uiConfirmOk').click();
    });
    
    await new Promise(r => setTimeout(r, 500));
    console.log("After clicking confirm, no page error?");
    
    await browser.close();
})();
