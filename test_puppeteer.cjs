const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const dir = path.join('.', 'Kore');
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
    
    for (const f of files) {
        const page = await browser.newPage();
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('PAGE CONSOLE ERROR in', f, ':', msg.text());
            }
        });
        page.on('pageerror', err => {
            console.log('PAGE ERROR in', f, ':', err.toString());
        });
        await page.goto(`http://localhost:3000/${f}`);
        await new Promise(r => setTimeout(r, 500));
        await page.close();
    }
    await browser.close();
})();
