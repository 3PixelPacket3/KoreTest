const fs = require('fs');
const path = require('path');

const dir = path.join('.', 'Kore');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const faviconStr = `<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%230ea5e9'/><text x='50' y='70' font-family='Arial' font-size='60' fill='white' text-anchor='middle'>K</text></svg>">`;

for (const f of files) {
    const filePath = path.join(dir, f);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (!content.includes('rel="icon"')) {
        content = content.replace(/<\/title>/, `</title>\n    ${faviconStr}`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Added favicon to", f);
    }
}
