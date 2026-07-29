const fs = require('fs');
const path = require('path');
const dir = './Kore';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('.hero-banner {') && content.includes('@media (max-width: 1023px) {')) {
        content = content.replace(
            /\.hero-banner \{\s*padding: 30px 15px !important;\s*\}/g,
            '.hero-banner {\n        padding: 30px 15px !important;\n        height: auto !important;\n        min-height: 160px;\n    }'
        );
        fs.writeFileSync(filePath, content);
        console.log(`Fixed hero-banner mobile height in ${file}`);
    }
});
