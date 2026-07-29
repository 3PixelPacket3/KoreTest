const fs = require('fs');
let content = fs.readFileSync('Kore/info-hub.html', 'utf8');
content = content.replace(
    '.toolbar { \n            display: flex; \n            gap: 16px; \n            margin-bottom: 24px;',
    '.toolbar { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 24px;'
);
fs.writeFileSync('Kore/info-hub.html', content);
console.log('Fixed info-hub.html toolbar');
