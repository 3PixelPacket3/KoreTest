const fs = require('fs');
let html = fs.readFileSync('Kore/work.html', 'utf8');

const targetStr = 'container.innerHTML = `<div style="text-align: center; padding: 60px 20px; color: var(--text-secondary); background: var(--bg-surface); border: 1px dashed var(--border-subtle); border-radius: var(--radius-md);"><h3>No tickets match your filters.</h3></div>`;';

const replaceStr = 'container.innerHTML = `<div style="text-align: center; padding: 60px 20px; color: var(--text-secondary); background: var(--bg-surface); border: 1px dashed var(--border-subtle); border-radius: var(--radius-md);"><h3>No tickets match your filters.</h3><p>There are ${masterWorkItems.filter(i => !i.archived && !i.deleted).length} total tickets. <a href="#" onclick="document.getElementById(\\\'filterStatus\\\').value=\\\'All\\\'; document.getElementById(\\\'filterType\\\').value=\\\'All\\\'; document.getElementById(\\\'filterAllocation\\\').value=\\\'All\\\'; updateFilters(); return false;" style="color: var(--accent-primary);">Clear Filters</a></p></div>`;';

if (html.includes(targetStr)) {
    html = html.replace(targetStr, replaceStr);
    fs.writeFileSync('Kore/work.html', html);
    console.log("Success");
} else {
    console.log("Target string not found.");
}
