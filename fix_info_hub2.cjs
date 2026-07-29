const fs = require('fs');
let content = fs.readFileSync('Kore/info-hub.html', 'utf8');
content = content.replace(
    '@media (max-width: 1023px) {',
    '@media (max-width: 1023px) {\n    .toolbar select { width: 100% !important; }\n    .toolbar .search-wrapper { width: 100% !important; }\n'
);
fs.writeFileSync('Kore/info-hub.html', content);
