const fs = require('fs');
const path = require('path');

const css = `
<style>
/* --- RESPONSIVE MOBILE & TABLET (Injected) --- */
* { box-sizing: border-box; }
img, video { max-width: 100%; height: auto; }
body { overflow-x: hidden; width: 100%; }

@media (max-width: 1024px) {
    .global-header {
        flex-direction: column;
        height: auto;
        padding: 10px 16px;
        gap: 10px;
    }
    .header-left {
        width: 100%;
        justify-content: space-between;
    }
    .header-right {
        width: 100%;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
    }
    .search-container {
        width: 100%;
    }
    .search-bar {
        width: 100%;
    }
    .mobile-toggle {
        display: flex !important;
        align-items: center;
        background: none;
        border: none;
        color: var(--text-main);
        cursor: pointer;
    }
    .nav-menu {
        display: none !important;
        flex-direction: column;
        width: 100%;
        background: var(--bg-surface);
        position: absolute;
        top: 100%;
        left: 0;
        box-shadow: var(--shadow-md);
        z-index: 200;
        max-height: 70vh;
        overflow-y: auto;
        border-top: 1px solid var(--border-subtle);
    }
    .nav-menu.open {
        display: flex !important;
    }
    .nav-item {
        padding: 15px 20px;
        border-bottom: 1px solid var(--border-subtle);
        width: 100%;
        flex-wrap: wrap;
        height: auto;
    }
    .nav-item:last-child {
        border-bottom: none;
    }
    .dropdown-content {
        position: static;
        display: none;
        box-shadow: none;
        border: none;
        border-radius: 0;
        width: 100%;
        padding-left: 20px;
        margin-top: 10px;
    }
    .nav-item:hover .dropdown-content, 
    .nav-item:focus-within .dropdown-content,
    .nav-item:active .dropdown-content {
        display: block;
    }
    
    .dashboard-grid, .dashboard-layout, .apps-grid, .grid-container {
        grid-template-columns: 1fr !important;
    }
    .main-container {
        padding: 15px !important;
    }
    .hero-banner {
        padding: 30px 15px !important;
    }
    .hero-title {
        font-size: 1.8rem !important;
    }
    
    /* Make tables scrollable */
    table, .table-container, .data-table-container {
        display: block;
        max-width: 100%;
        overflow-x: auto;
        white-space: nowrap;
    }
    
    /* Ensure containers don't overflow */
    .panel, .card, .widget, .card-body, .intel-panel, .info-panel {
        max-width: 100%;
        overflow-x: hidden;
    }

    /* Layout fixes for sidebars */
    .workspace-layout {
        flex-direction: column !important;
    }
    .sidebar {
        width: 100% !important;
        max-height: none !important;
        border-right: none !important;
        border-bottom: 1px solid var(--border-subtle);
    }
}
</style>
`;

const dir = './Kore';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if we already injected
    if (content.includes('/* --- RESPONSIVE MOBILE & TABLET (Injected) --- */')) {
        console.log(`Skipping ${file}, already injected.`);
        return;
    }
    
    // Insert right before </head>
    if (content.includes('</head>')) {
        content = content.replace('</head>', css + '\n</head>');
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    } else {
        console.log(`Could not find </head> in ${file}`);
    }
});
