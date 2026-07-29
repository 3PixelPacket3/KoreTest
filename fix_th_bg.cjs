const fs = require('fs');
const path = require('path');

const dir = path.join('.', 'Kore');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let changed = 0;
for (const f of files) {
    const filePath = path.join(dir, f);
    let content = fs.readFileSync(filePath, 'utf8');
    
    const originalContent = content;

    content = content.replace(/th\s*{\s*background:\s*#f8fafc;/gi, 'th { background: var(--bg-app);');
    content = content.replace(/th\s*{\s*background-color:\s*#f8fafc;/gi, 'th { background-color: var(--bg-app);');
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        changed++;
        console.log("Updated th in", f);
    }
}
console.log("Changed files:", changed);
