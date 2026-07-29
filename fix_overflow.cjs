const fs = require('fs');
const path = require('path');
const dir = './Kore';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('overflow-x: hidden;')) {
        // Only replace it within the injected block if possible.
        // Wait, 'body { overflow-x: hidden; width: 100%; }' is also there. Body is fine.
        // We only want to replace the overflow-x for .panel, .card, etc.
        content = content.replace('.panel, .card, .widget, .card-body, .intel-panel, .info-panel {\n        max-width: 100%;\n        overflow-x: hidden;\n    }', '.panel, .card, .widget, .card-body, .intel-panel, .info-panel {\n        max-width: 100%;\n        overflow-x: auto;\n    }');
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file} overflow.`);
    }
});
