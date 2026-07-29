const fs = require('fs');
const path = require('path');

const dir = './Kore';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');

    // Fix the broken appendChatMessage remnants
    content = content.replace(/`;\s*msg\.innerHTML = text;\s*container\.appendChild\(msg\);\s*container\.scrollTop = container\.scrollHeight;\s*\}/g, '');
    
    content = content.replace(/msg\.innerHTML = text;\s*container\.appendChild\(msg\);\s*container\.scrollTop = container\.scrollHeight;\s*\}/g, '');

    content = content.replace(/const container = document\.getElementById\('copilotMessages'\);\s*/g, '');

    fs.writeFileSync(path.join(dir, file), content, 'utf8');
});
console.log("Fixed HTML files.");
