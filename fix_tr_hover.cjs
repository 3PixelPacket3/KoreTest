const fs = require('fs');
const path = require('path');

const dir = path.join('.', 'Kore');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let changed = 0;
for (const f of files) {
    const filePath = path.join(dir, f);
    let content = fs.readFileSync(filePath, 'utf8');
    
    const originalContent = content;

    content = content.replace(/tr:hover\s+td\s*{\s*background-color:\s*#[a-fA-F0-9]{3,6};/gi, 'tr:hover td { background-color: rgba(14, 165, 233, 0.05);');
    content = content.replace(/tr:hover\s*{\s*background-color:\s*#[a-fA-F0-9]{3,6};/gi, 'tr:hover { background-color: rgba(14, 165, 233, 0.05);');
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        changed++;
        console.log("Updated table hover in", f);
    }
}
console.log("Changed files:", changed);
