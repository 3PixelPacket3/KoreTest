const fs = require('fs');
const path = require('path');
const { parse } = require('acorn');

const dir = './Kore';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    const scripts = content.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi);
    if (scripts) {
        scripts.forEach((scriptTag, idx) => {
            const match = scriptTag.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i);
            if (match && match[1]) {
                const code = match[1];
                try {
                    parse(code, { ecmaVersion: 'latest', sourceType: 'script' });
                } catch (e) {
                    console.error(`Syntax Error in ${file}, script #${idx + 1}: ${e.message}`);
                }
            }
        });
    }
});
