const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    page.on('dialog', async dialog => {
        console.log('DIALOG:', dialog.message());
        await dialog.dismiss();
    });
    
    await page.goto('http://localhost:3000/settings.html');
    
    // Inject mock data
    await page.evaluate(() => {
        localStorage.setItem('kore_work_items', JSON.stringify([
            { id: 123, title: 'Number ID', status: 'Open' }
        ]));
    });
    
    await page.waitForSelector('#exportTrackerCsvBtn');
    console.log('Clicking exportTrackerCsvBtn');
    await page.click('#exportTrackerCsvBtn');
    await new Promise(r => setTimeout(r, 1000));
    await browser.close();
})();
