const fs = require('fs');
const path = require('path');

const file = path.join('.', 'Kore', 'docs.html');
let content = fs.readFileSync(file, 'utf8');

const oldCode = `            if (doc.isGlobal) {
                const code = prompt(\`Enter Master Admin Code to delete Global item:\`);
                if (code !== "admin") { alert("Authorization Denied."); return; }
            } else if (!confirm(\`Are you certain you wish to delete this document?\`)) {
                return;
            }`;

const newCode = `            if (doc.isGlobal) {
                if (!window.isAdminUser) { alert("Authorization Denied. Admin access required."); return; }
                if (!confirm(\`Delete this Global document?\`)) return;
            } else if (!confirm(\`Are you certain you wish to delete this document?\`)) {
                return;
            }`;

if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Fixed docs.html admin check");
} else {
    console.log("Could not find the code in docs.html");
}
