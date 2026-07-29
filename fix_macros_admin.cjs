const fs = require('fs');
const path = require('path');

const file = path.join('.', 'Kore', 'macros.html');
let content = fs.readFileSync(file, 'utf8');

const oldCode = `            if (targetMacro.isGlobal) {
                const code = prompt("Enter Master Admin Code to delete a Global Macro:");
                if (code !== "admin") { alert("Authorization Denied. Invalid Code."); return; }
            } else if (!confirm("Delete this macro permanently?")) {
                return;
            }`;

const newCode = `            if (targetMacro.isGlobal) {
                if (!window.isAdminUser) { alert("Authorization Denied. Admin access required."); return; }
                if (!confirm("Delete this Global macro permanently?")) return;
            } else if (!confirm("Delete this macro permanently?")) {
                return;
            }`;

if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Fixed macros.html admin check");
} else {
    console.log("Could not find the code in macros.html");
}
