const fs = require('fs');
let content = fs.readFileSync('Kore/about.html', 'utf8');

content = content.replace(
    '@media (max-width: 1023px) {',
    '@media (max-width: 1023px) {\n    .panel-card { padding: 20px !important; }\n'
);

fs.writeFileSync('Kore/about.html', content);
console.log('Fixed panel-card padding on mobile');
