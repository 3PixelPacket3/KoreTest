const fs = require('fs');
let content = fs.readFileSync('Kore/settings.html', 'utf8');

content = content.replace(
    'flex-direction: row; justify-content: space-between; align-items: center; flex-wrap: wrap;"',
    'display: flex; flex-direction: row; justify-content: space-between; align-items: center; flex-wrap: wrap;"'
);

fs.writeFileSync('Kore/settings.html', content);
