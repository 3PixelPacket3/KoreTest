const fs = require('fs');
const path = require('path');
const dir = './Kore';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('@media (max-width: 1024px) {')) {
        content = content.replace('@media (max-width: 1024px) {', '@media (max-width: 1023px) {');
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file} breakpoint.`);
    }
});
