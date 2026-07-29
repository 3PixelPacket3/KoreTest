const fs = require('fs');
const path = require('path');

const dir = path.join('.', 'Kore');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let changed = 0;
for (const f of files) {
    const filePath = path.join(dir, f);
    let content = fs.readFileSync(filePath, 'utf8');
    
    const originalContent = content;

    // Replace `#ffffff` or `white` (when used as background for containers) with `var(--bg-surface)`
    content = content.replace(/background-color:\s*#ffffff;/gi, 'background-color: var(--bg-surface);');
    content = content.replace(/background:\s*#ffffff;/gi, 'background: var(--bg-surface);');
    
    // Some buttons or tags might need specific attention, but the generic ones above catch the main issues.
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        changed++;
        console.log("Updated background in", f);
    }
}
console.log("Changed files:", changed);
