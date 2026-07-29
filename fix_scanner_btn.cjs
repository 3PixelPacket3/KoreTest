const fs = require('fs');
const path = require('path');

const file = path.join('.', 'Kore', 'scanner.html');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\.btn-primary\s*{\s*background-color:\s*var\(--text-main\);\s*color:\s*white;\s*}/g, '.btn-primary { background-color: var(--text-main); color: var(--bg-app); }');

fs.writeFileSync(file, content, 'utf8');
