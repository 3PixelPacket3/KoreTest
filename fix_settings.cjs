const fs = require('fs');
let content = fs.readFileSync('Kore/settings.html', 'utf8');
content = content.replace(
    '.kpi-grid, .nav-pref-grid, .color-target-grid {',
    '.kpi-grid, .nav-pref-grid, .color-target-grid, .settings-grid {'
);
fs.writeFileSync('Kore/settings.html', content);
console.log('Fixed settings.html grid');
