const fs = require('fs');
let content = fs.readFileSync('Kore/lod.html', 'utf8');
content = content.replace(
    '.kpi-grid, .nav-pref-grid, .color-target-grid {',
    '.kpi-grid, .nav-pref-grid, .color-target-grid, .rules-grid {'
);
fs.writeFileSync('Kore/lod.html', content);
console.log('Fixed lod.html rules grid on mobile');
