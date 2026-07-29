const fs = require('fs');
const { parse } = require('acorn');

const html = fs.readFileSync('Kore/create-page.html', 'utf8');
const regex = /<script.*?>([\s\S]*?)<\/script>/gi;
let match;
while ((match = regex.exec(html)) !== null) {
    const script = match[1];
    try {
        parse(script, { ecmaVersion: 2022, sourceType: 'script' });
    } catch (e) {
        console.log(`Syntax Error in create-page.html: ${e.message}`);
    }
}
