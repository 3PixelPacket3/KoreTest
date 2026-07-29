const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const acorn = require('acorn');

const dir = path.join('.', 'Kore');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
for (const f of files) {
    const content = fs.readFileSync(path.join(dir, f), 'utf8');
    const dom = new JSDOM(content);
    const elements = dom.window.document.querySelectorAll('*');
    elements.forEach((el, idx) => {
        for (const attr of el.attributes) {
            if (attr.name.startsWith('on')) {
                try {
                    acorn.parse(attr.value, { ecmaVersion: 2020 });
                } catch(e) {
                    if (e.message.includes("'return' outside of function")) continue; // common in attributes
                    console.log(`Syntax Error in ${f}, ${attr.name}: ${e.message} - ${attr.value}`);
                }
            }
        }
    });
}
