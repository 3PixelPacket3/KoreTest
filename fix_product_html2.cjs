const fs = require('fs');
let content = fs.readFileSync('Kore/product-html.html', 'utf8');
content = content.replace(
    'style="min-width: 320px;"',
    'style="width: 100%; min-width: 250px; max-width: 100%;"'
);
fs.writeFileSync('Kore/product-html.html', content);
console.log('Fixed product-html.html select width');
