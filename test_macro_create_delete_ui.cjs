const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    await page.goto('http://localhost:3000/macros.html');
    await new Promise(r => setTimeout(r, 1000));
    
    await page.evaluate(() => {
        document.querySelector('[onclick="openEditor()"]').click();
    });
    
    await new Promise(r => setTimeout(r, 500));
    
    await page.evaluate(() => {
        document.getElementById('editTitle').value = 'Test Macro';
        document.getElementById('editDesc').value = 'Test Desc';
        document.querySelector('.code-part-title').value = 'Test Snippet';
        document.querySelector('.code-part-body').value = 'console.log("hello");';
        saveMacro();
    });
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Check if macro is active
    console.log("Current Macro ID:", await page.evaluate(() => currentMacroId));
    
    await page.evaluate(() => {
        document.getElementById('deleteMacroBtn').click();
    });
    
    await new Promise(r => setTimeout(r, 500));
    
    // click confirm
    await page.evaluate(() => {
        const btn = document.getElementById('uiConfirmOk');
        if (btn) btn.click();
    });
    
    await new Promise(r => setTimeout(r, 1000));
    
    console.log("Current Macro ID after delete:", await page.evaluate(() => currentMacroId));
    
    await browser.close();
})();
