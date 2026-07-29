const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    
    const checkFile = async (url) => {
        const page = await browser.newPage();
        page.on('pageerror', err => console.log('PAGE ERROR in ' + url + ':', err.toString()));
        await page.goto(url);
        await new Promise(r => setTimeout(r, 500));
        await page.close();
    }
    
    const fs = require('fs');
    const files = fs.readdirSync('Kore').filter(f => f.endsWith('.html'));
    for (const f of files) {
        await checkFile('http://localhost:3000/' + f);
    }
    
    await browser.close();
})();
