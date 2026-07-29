const fs = require('fs');
const path = require('path');

const file = path.join('.', 'Kore', 'settings.html');
let content = fs.readFileSync(file, 'utf8');

const oldStr = `const escapeStr = (str) => \`"\${(str || '').replace(/"/g, '""')}"\`;`;
const newStr = `const escapeStr = (str) => \`"\${(str != null ? String(str) : '').replace(/"/g, '""')}"\`;`;

content = content.replace(oldStr, newStr);
fs.writeFileSync(file, content, 'utf8');
console.log("Fixed CSV escape string logic");
