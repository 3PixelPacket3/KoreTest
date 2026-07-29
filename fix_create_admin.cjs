const fs = require('fs');
const path = require('path');

const file = path.join('.', 'Kore', 'create-page.html');
let content = fs.readFileSync(file, 'utf8');

const oldCode = `            if (globalToggleEl.checked) {
                const code = prompt("🔒 Enter Master Admin Code to archive a Global Info Hub page:");
                const adminData = await loadCloudData('admin_settings') || { pin: 'Admin2026!' };
                if (code !== (adminData.pin || 'Admin2026!')) {
                    alert("Authorization Denied. Invalid Code."); return;
                }
            } else if (!confirm('Archive this personal page?')) { return; }`;

const newCode = `            if (globalToggleEl.checked) {
                if (!window.isAdminUser) { alert("Authorization Denied. Admin access required."); return; }
                if (!confirm('Archive this Global Info Hub page?')) return;
            } else if (!confirm('Archive this personal page?')) { return; }`;

if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Fixed create-page.html admin check");
} else {
    console.log("Could not find the code in create-page.html");
}
