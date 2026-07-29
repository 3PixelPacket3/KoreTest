const fs = require('fs');
const path = require('path');
const dir = './Kore';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const footerCss = `
    .global-footer { background-color: var(--bg-surface, #ffffff); border-top: 1px solid var(--border-subtle, #e2e8f0); padding: 24px; text-align: center; color: var(--text-secondary, #475569); font-size: 0.9rem; margin-top: auto; font-weight: 600; width: 100%; box-sizing: border-box; }
`;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Add footer CSS if missing
    if (!content.includes('.global-footer {')) {
        content = content.replace('</style>', footerCss + '\n</style>');
        console.log(`Added footer CSS to ${file}`);
    }

    // Fix Password Generator output
    if (file === 'passwords.html') {
        content = content.replace('<input type="text" id="pwOutput" class="output-box" readonly aria-label="Generated password">', '<textarea id="pwOutput" class="output-box" readonly aria-label="Generated password" rows="2" style="resize: none; word-break: break-all; overflow: hidden; display: flex; align-items: center; justify-content: center; min-height: 80px;"></textarea>');
        console.log(`Fixed passwords.html output box`);
    }

    // Fix Nebula Forge Copy Button
    if (file === 'nebula.html') {
        content = content.replace('<div class="panel-title" style="display: flex; justify-content: space-between; align-items: center;">', '<div class="panel-title" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">');
        console.log(`Fixed nebula.html title flex wrap`);
    }

    // Fix Macros Hero Title & Button (to not overlap on mobile)
    if (file === 'macros.html') {
        content = content.replace('.hero-overlay { position: relative; z-index: 2; width: 100%; background: linear-gradient(to right, rgba(15,23,42,0.95), rgba(15,23,42,0.6)); padding: 24px 30px; box-sizing: border-box; color: white; display: flex; justify-content: space-between; align-items: flex-end;}', '.hero-overlay { position: relative; z-index: 2; width: 100%; background: linear-gradient(to right, rgba(15,23,42,0.95), rgba(15,23,42,0.6)); padding: 24px 30px; box-sizing: border-box; color: white; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px; }');
        console.log(`Fixed macros.html hero flex`);
    }

    fs.writeFileSync(filePath, content);
});
