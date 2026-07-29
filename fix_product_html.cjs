const fs = require('fs');
let content = fs.readFileSync('Kore/product-html.html', 'utf8');
content = content.replace(
    '.toolbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; background: var(--bg-surface); padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); box-shadow: var(--shadow-sm); }',
    '.toolbar { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; background: var(--bg-surface); padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); box-shadow: var(--shadow-sm); }'
);
fs.writeFileSync('Kore/product-html.html', content);
console.log('Fixed product-html.html toolbar wrapping');
