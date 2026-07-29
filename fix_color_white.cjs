const fs = require('fs');
const path = require('path');

const dir = path.join('.', 'Kore');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let changed = 0;
for (const f of files) {
    const filePath = path.join(dir, f);
    let content = fs.readFileSync(filePath, 'utf8');
    
    const originalContent = content;

    content = content.replace(/background:\s*var\(--text-main\);\s*color:\s*white;/gi, 'background: var(--text-main); color: var(--bg-app);');
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        changed++;
        console.log("Updated white color on var(--text-main) background in", f);
    }
}
console.log("Changed files:", changed);
