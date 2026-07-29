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
    
    await checkFile('http://localhost:3000/create-page.html');
    await checkFile('http://localhost:3000/macros.html');
    await checkFile('http://localhost:3000/nebula.html');
    await checkFile('http://localhost:3000/info-page.html');
    await checkFile('http://localhost:3000/docs.html');
    await checkFile('http://localhost:3000/info-archive.html');
    await checkFile('http://localhost:3000/product-html.html');
    await checkFile('http://localhost:3000/apps.html');
    
    await browser.close();
})();
