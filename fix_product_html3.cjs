const fs = require('fs');
let content = fs.readFileSync('Kore/product-html.html', 'utf8');

if (content.includes('@media (max-width: 1023px) {')) {
    content = content.replace(
        '@media (max-width: 1023px) {',
        '@media (max-width: 1023px) {\n    .filter-item select { width: 100% !important; }\n    .actions-group { flex-wrap: wrap; }\n'
    );
    fs.writeFileSync('Kore/product-html.html', content);
    console.log('Fixed product-html.html filters on mobile');
}
