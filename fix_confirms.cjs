const fs = require('fs');
const path = require('path');

const customConfirmStr = `
        window.uiConfirm = function(msg) {
            return new Promise(resolve => {
                const overlay = document.createElement('div');
                overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;';
                const box = document.createElement('div');
                box.style.cssText = 'background:var(--bg-surface,#fff);padding:24px;border-radius:8px;max-width:400px;text-align:center;box-shadow:0 10px 25px rgba(0,0,0,0.2);border:1px solid var(--border-subtle,#ccc);color:var(--text-main,#000);font-family:sans-serif;';
                box.innerHTML = '<p style="margin-top:0;margin-bottom:24px;font-size:1.1rem;">' + msg + '</p>' +
                                '<div style="display:flex;gap:12px;justify-content:center;">' +
                                '<button id="uiConfirmCancel" style="padding:8px 16px;border:1px solid #ccc;background:transparent;cursor:pointer;border-radius:4px;color:var(--text-main,#000);">Cancel</button>' +
                                '<button id="uiConfirmOk" style="padding:8px 16px;border:none;background:#ef4444;color:#fff;cursor:pointer;border-radius:4px;">Confirm</button>' +
                                '</div>';
                overlay.appendChild(box);
                document.body.appendChild(overlay);
                document.getElementById('uiConfirmCancel').onclick = () => { document.body.removeChild(overlay); resolve(false); };
                document.getElementById('uiConfirmOk').onclick = () => { document.body.removeChild(overlay); resolve(true); };
            });
        };
`;

function fixFile(file, replaces) {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('window.uiConfirm')) {
        content = content.replace('</head>', `    <script>${customConfirmStr}</script>\n</head>`);
    }
    for (const rep of replaces) {
        content = content.replace(rep[0], rep[1]);
    }
    fs.writeFileSync(file, content, 'utf8');
    console.log("Fixed", file);
}

// macros.html
fixFile('Kore/macros.html', [
    ['if (!confirm("Delete this Global macro permanently?")) return;', 'if (!(await uiConfirm("Delete this Global macro permanently?"))) return;'],
    ['} else if (!confirm("Delete this macro permanently?")) {', '} else if (!(await uiConfirm("Delete this macro permanently?"))) {']
]);

// nebula.html
fixFile('Kore/nebula.html', [
    ["document.getElementById('clearEditorBtn').addEventListener('click', () => {", "document.getElementById('clearEditorBtn').addEventListener('click', async () => {"],
    ['if (confirm("Are you sure you want to clear the editor?")) {', 'if (await uiConfirm("Are you sure you want to clear the editor?")) {']
]);

// info-page.html
fixFile('Kore/info-page.html', [
    ['if (!confirm("Delete this Global Info Hub page?")) {', 'if (!(await uiConfirm("Delete this Global Info Hub page?"))) {'],
    ["} else if (!confirm('Archive this personal page? It will be removed from the main Info Hub.')) {", "} else if (!(await uiConfirm('Archive this personal page? It will be removed from the main Info Hub.'))) {"]
]);

// docs.html
fixFile('Kore/docs.html', [
    ['if (!confirm(`Delete this Global document?`)) return;', 'if (!(await uiConfirm(`Delete this Global document?`))) return;'],
    ['} else if (!confirm(`Are you certain you wish to delete this document?`)) {', '} else if (!(await uiConfirm(`Are you certain you wish to delete this document?`))) {']
]);


fixFile('Kore/info-archive.html', [
    ['if (!confirm("Permanently delete the selected archived pages? This will wipe the data from the cloud vault and cannot be undone.")) {', 'if (!(await uiConfirm("Permanently delete the selected archived pages? This will wipe the data from the cloud vault and cannot be undone."))) {']
]);

fixFile('Kore/create-page.html', [
    ['if (confirm(\'Insert How-To template? This overwrites current content.\')) {', 'if (await uiConfirm(\'Insert How-To template? This overwrites current content.\')) {'],
    ['if(confirm(\'Clear form?\')) window.location.href = \'create-page.html\';', 'if(await uiConfirm(\'Clear form?\')) window.location.href = \'create-page.html\';'],
    ['if (!confirm(\'Archive this Global Info Hub page?\')) return;', 'if (!(await uiConfirm(\'Archive this Global Info Hub page?\'))) return;'],
    ["} else if (!confirm('Archive this personal page?')) { return; }", "} else if (!(await uiConfirm('Archive this personal page?'))) { return; }"]
]);

fixFile('Kore/product-html.html', [
    ['if (confirm("Are you sure you want to delete this preset from the cloud?")) {', 'if (await uiConfirm("Are you sure you want to delete this preset from the cloud?")) {']
]);

fixFile('Kore/apps.html', [
    ['if(confirm("Are you sure you want to remove this application?")) {', 'if(await uiConfirm("Are you sure you want to remove this application?")) {']
]);
