const fs = require('fs');
let content = fs.readFileSync('Kore/nebula.html', 'utf8');
content = content.replace(
    '<div style="display: flex; gap: 8px;">',
    '<div style="display: flex; gap: 8px; flex-wrap: wrap;">'
);
fs.writeFileSync('Kore/nebula.html', content);
console.log('Fixed inner flex wrap in nebula.html');
