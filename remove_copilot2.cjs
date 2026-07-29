const fs = require('fs');
const path = require('path');

const dir = './Kore';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');

    // Remove anything from .copilot-trigger down to the end of the input-area buttons
    content = content.replace(/\.copilot-trigger[\s\S]*?\.copilot-input-area button:hover\s*\{[^\}]*\}/g, '');
    
    // In index.html, it might be formatted differently
    content = content.replace(/\.copilot-trigger\s*\{[\s\S]*?\}\s*\.copilot-trigger:hover\s*\{[\s\S]*?\}/g, '');
    
    // Also let's check for any remaining copilot HTML
    content = content.replace(/<button class="copilot-trigger"[^>]*>[\s\S]*?<\/button>\s*<div class="copilot-window"[^>]*>[\s\S]*?<\/form>\s*<\/div>/g, '');
    // In index.html it might be slightly different?
    content = content.replace(/<button class="copilot-trigger"[^>]*>[\s\S]*?<\/button>\s*<div class="copilot-window"[^>]*>[\s\S]*?<\/div>\s*<\/div>/g, '');

    // Any toggleCopilot references
    content = content.replace(/onclick="toggleCopilot\(\)"/g, '');

    fs.writeFileSync(path.join(dir, file), content, 'utf8');
});
console.log("Done.");
