const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    await page.goto('http://localhost:3000/info-hub.html');
    await page.evaluate(async () => {
        await fetch('/api/save_info_page', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: 'dummy123', title: 'Test', authorId: 'local-dev', isGlobal: false, archived: false })
        });
    });

    await page.goto('http://localhost:3000/info-page.html?id=dummy123');
    await new Promise(r => setTimeout(r, 1000));
    
    const errDisplay = await page.evaluate(() => document.getElementById('errorContainer').style.display);
    const contentDisplay = await page.evaluate(() => document.getElementById('contentGrid').style.display);
    console.log("Error Display:", errDisplay, "Content Display:", contentDisplay);
    
    await browser.close();
})();
