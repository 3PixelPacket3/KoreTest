const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    
    // allow dialogs
    page.on('dialog', async dialog => {
        console.log('Dialog opened:', dialog.message());
        await dialog.accept();
    });

    await page.goto('http://localhost:3000/macros.html');
    await new Promise(r => setTimeout(r, 1000));
    
    await page.evaluate(() => {
        window.macrosData = [{id: 'm1', title: 'Test Macro', isGlobal: false}];
        window.currentMacroId = 'm1';
        return window.deleteCurrentMacro();
    });
    
    console.log('Executed deleteCurrentMacro');
    await new Promise(r => setTimeout(r, 500));
    
    await browser.close();
})();
