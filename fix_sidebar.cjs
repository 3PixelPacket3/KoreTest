const fs = require('fs');
const path = require('path');
const dir = './Kore';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add position: static to sidebar in mobile view
    if (content.includes('.sidebar {') && content.includes('@media (max-width: 1023px) {')) {
        content = content.replace(
            /\.sidebar \{\s*width: 100% !important;\s*max-height: none !important;\s*border-right: none !important;\s*border-bottom: 1px solid var\(--border-subtle\);\s*\}/,
            '.sidebar {\n        width: 100% !important;\n        max-height: none !important;\n        border-right: none !important;\n        border-bottom: 1px solid var(--border-subtle);\n        position: static !important;\n    }'
        );
        fs.writeFileSync(filePath, content);
        console.log(`Fixed sidebar sticky on mobile in ${file}`);
    }
});
