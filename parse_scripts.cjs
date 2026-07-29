const fs = require('fs');
const { parse } = require('acorn');

const files = fs.readdirSync('Kore').filter(f => f.endsWith('.html'));
for (const file of files) {
    const content = fs.readFileSync('Kore/' + file, 'utf8');
    const regex = /<script.*?>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const script = match[1];
        try {
            parse(script, { ecmaVersion: 2022, sourceType: 'module' });
        } catch (e) {
            console.log(`Syntax Error in ${file}: ${e.message}`);
        }
    }
}
