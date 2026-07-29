const fs = require('fs');
let content = fs.readFileSync('Kore/about.html', 'utf8');

content = content.replace(
    '.accordion-body { padding: 20px; font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6; white-space: pre-wrap; }',
    '.accordion-body { padding: 20px; font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6; white-space: pre-wrap; word-break: break-word; overflow-x: auto; }'
);

fs.writeFileSync('Kore/about.html', content);
console.log('Fixed about.html accordion body wrapping');
