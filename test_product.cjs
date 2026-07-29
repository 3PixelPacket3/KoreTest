const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    
    await page.goto('http://localhost:3000/product-html.html');
    await new Promise(r => setTimeout(r, 1000));
    
    await page.evaluate(() => {
        // mock a preset
        savedPresets = [{name: 'test', data: 'data'}];
        document.getElementById("presetSelect").innerHTML = '<option value="0">test</option>';
        document.getElementById("presetSelect").value = "0";
        deletePreset();
    });
    
    await new Promise(r => setTimeout(r, 500));
    
    await page.evaluate(() => {
        const btn = document.getElementById('uiConfirmOk');
        if (btn) btn.click();
    });
    
    await new Promise(r => setTimeout(r, 1000));
    console.log("Done");
    await browser.close();
})();
