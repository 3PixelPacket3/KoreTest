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
        const res = await fetch('/api/get_info_pages?userId=local-dev');
        const data = await res.json();
        console.log("Pages:", JSON.stringify(data));
    });
    
    await browser.close();
})();
