const fs = require('fs');
const path = require('path');
const dir = './Kore';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const cssToInject = `
    .dashboard-grid, .dashboard-layout, .apps-grid, .grid-container,
    .layout-grid, .chart-grid, .library-controls, .add-task-panel,
    .controls-grid, .content-grid, .layout-split, .form-grid,
    .metrics-bar, .view-boxes, .grid-2, .workspace-grid,
    .kpi-grid, .nav-pref-grid, .color-target-grid {
        grid-template-columns: 1fr !important;
    }
    .metrics-bar, .form-grid {
        gap: 16px !important;
    }
`;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    content = content.replace(
        /\.dashboard-grid, \.dashboard-layout, \.apps-grid, \.grid-container \{\s*grid-template-columns: 1fr !important;\s*\}/,
        cssToInject.trim()
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated grid layouts in ${file}`);
});
