const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    page.on('dialog', async dialog => {
        console.log('Dialog opened:', dialog.message());
        await dialog.accept();
    });

    await page.goto('http://localhost:3000/info-hub.html');
    await new Promise(r => setTimeout(r, 1000));
    
    await page.evaluate(async () => {
        await fetch('/api/save_info_page', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: 'dummy123', title: 'Test', authorId: 'mock-user-123', isGlobal: false, archived: false })
        });
    });

    await page.goto('http://localhost:3000/info-page.html?id=dummy123');
    await new Promise(r => setTimeout(r, 1000));
    
    await page.evaluate(() => {
        document.getElementById('archivePageBtn').click();
    });
    
    await new Promise(r => setTimeout(r, 1000));
    console.log("URL after:", page.url());
    
    await browser.close();
})();
