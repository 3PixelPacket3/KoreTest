const fs = require('fs');
let content = fs.readFileSync('Kore/docs.html', 'utf8');

const promptCode = `
        window.uiPrompt = function(msg) {
            return new Promise(resolve => {
                const overlay = document.createElement('div');
                overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;';
                const box = document.createElement('div');
                box.style.cssText = 'background:var(--bg-surface,#fff);padding:24px;border-radius:8px;max-width:400px;text-align:center;box-shadow:0 10px 25px rgba(0,0,0,0.2);border:1px solid var(--border-subtle,#ccc);color:var(--text-main,#000);font-family:sans-serif;width:90%;';
                box.innerHTML = '<p style="margin-top:0;margin-bottom:16px;font-size:1.1rem;">' + msg + '</p>' +
                                '<input type="text" id="uiPromptInput" style="width:100%;padding:10px;margin-bottom:24px;border:1px solid #ccc;border-radius:4px;box-sizing:border-box;">' +
                                '<div style="display:flex;gap:12px;justify-content:center;">' +
                                '<button id="uiPromptCancel" style="padding:8px 16px;border:1px solid #ccc;background:transparent;cursor:pointer;border-radius:4px;color:var(--text-main,#000);">Cancel</button>' +
                                '<button id="uiPromptOk" style="padding:8px 16px;border:none;background:#0ea5e9;color:#fff;cursor:pointer;border-radius:4px;">OK</button>' +
                                '</div>';
                overlay.appendChild(box);
                document.body.appendChild(overlay);
                document.getElementById('uiPromptInput').focus();
                document.getElementById('uiPromptCancel').onclick = () => { document.body.removeChild(overlay); resolve(null); };
                document.getElementById('uiPromptOk').onclick = () => { const val = document.getElementById('uiPromptInput').value; document.body.removeChild(overlay); resolve(val); };
                document.getElementById('uiPromptInput').onkeydown = (e) => { if(e.key === 'Enter') document.getElementById('uiPromptOk').click(); };
            });
        };
`;

content = content.replace('window.uiConfirm = function', promptCode + '\n        window.uiConfirm = function');
content = content.replace('prompt("Enter new folder name:");', 'await window.uiPrompt("Enter new folder name:");');

fs.writeFileSync('Kore/docs.html', content);
console.log('Fixed prompt in docs.html');
