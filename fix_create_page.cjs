const fs = require('fs');
let content = fs.readFileSync('Kore/create-page.html', 'utf8');
content = content.replace(
    "document.getElementById('insertTemplateBtn').addEventListener('click', () => {",
    "document.getElementById('insertTemplateBtn').addEventListener('click', async () => {"
);
fs.writeFileSync('Kore/create-page.html', content);
