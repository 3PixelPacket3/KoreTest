const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    let dialogFired = false;
    page.on('dialog', async dialog => {
        dialogFired = true;
        console.log('Dialog:', dialog.message());
        await dialog.accept();
    });

    await page.goto('http://localhost:3000/macros.html');
    await new Promise(r => setTimeout(r, 1000));
    
    await page.evaluate(() => {
        document.querySelector('[onclick="openEditor()"]').click();
    });
    
    await new Promise(r => setTimeout(r, 500));
    
    await page.evaluate(() => {
        document.getElementById('editTitle').value = 'Test Macro';
        document.getElementById('editDesc').value = 'Test Desc';
        // Add a block
        document.querySelector('.code-part-title').value = 'Test Snippet';
        document.querySelector('.code-part-body').value = 'console.log("hello");';
        saveMacro();
    });
    
    await new Promise(r => setTimeout(r, 500));
    
    await page.evaluate(() => {
        document.getElementById('deleteMacroBtn').click();
    });
    
    await new Promise(r => setTimeout(r, 500));
    console.log("Dialog fired:", dialogFired);
    console.log("Current Macro ID:", await page.evaluate(() => currentMacroId));
    
    await browser.close();
})();
