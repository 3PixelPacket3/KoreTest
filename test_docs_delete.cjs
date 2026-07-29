const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    
    page.on('dialog', async dialog => {
        console.log('Dialog opened:', dialog.message());
        await dialog.accept();
    });

    await page.goto('http://localhost:3000/docs.html');
    await new Promise(r => setTimeout(r, 1000));
    
    await page.evaluate(async () => {
        // inject dummy document
        personalVault = [{ id: 'doc1', name: 'test.pdf', type: 'application/pdf', size: 1000, date: Date.now(), isGlobal: false }];
        combinedVault = personalVault;
        renderLibrary();
    });
    
    await new Promise(r => setTimeout(r, 500));
    
    await page.evaluate(() => {
        document.querySelector('.btn-delete').click();
    });
    
    await new Promise(r => setTimeout(r, 1000));
    
    const vaultSize = await page.evaluate(() => combinedVault.length);
    console.log("Vault Size after:", vaultSize);
    
    await browser.close();
})();
