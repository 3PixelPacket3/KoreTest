const fs = require('fs');
const path = require('path');

const file = path.join('.', 'Kore', 'settings.html');
let content = fs.readFileSync(file, 'utf8');

const oldLogic = `            const blob = new Blob([finalPayload], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = \`KORE_BACKUP_\${wantsEncryption ? 'ENCRYPTED_' : ''}\${new Date().toISOString().split('T')[0]}_[\${hashString}].json\`;
            a.click();`;

const newLogic = `            const blob = new Blob([finalPayload], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = \`KORE_BACKUP_\${wantsEncryption ? 'ENCRYPTED_' : ''}\${new Date().toISOString().split('T')[0]}_[\${hashString}].json\`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync(file, content, 'utf8');
console.log("Fixed JSON download link");
