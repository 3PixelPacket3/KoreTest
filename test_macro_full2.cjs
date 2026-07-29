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
    
    // create a macro
    await page.click('[onclick="openEditor()"]');
    await new Promise(r => setTimeout(r, 500));
    
    await page.type('#editTitle', 'Test Macro 123');
    await page.click('button[onclick="saveMacro()"]');
    await new Promise(r => setTimeout(r, 1000));
    
    // Macro is now active. Let's click delete.
    await page.click('#deleteMacroBtn');
    await new Promise(r => setTimeout(r, 1000));
    
    await browser.close();
})();
