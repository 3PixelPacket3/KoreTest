const fs = require('fs');
const path = require('path');

const dir = path.join('.', 'Kore');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let changed = 0;
for (const f of files) {
    const filePath = path.join(dir, f);
    let content = fs.readFileSync(filePath, 'utf8');
    
    const originalContent = content;

    content = content.replace(/background-color:\s*#f0f9ff;/gi, 'background-color: rgba(14, 165, 233, 0.08);');
    content = content.replace(/background:\s*#f0f9ff;/gi, 'background: rgba(14, 165, 233, 0.08);');
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        changed++;
        console.log("Updated hover in", f);
    }
}
console.log("Changed files:", changed);
