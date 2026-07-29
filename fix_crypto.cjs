const fs = require('fs');
const path = require('path');

const file = path.join('.', 'Kore', 'settings.html');
let content = fs.readFileSync(file, 'utf8');

const oldCrypto = `            const encoder = new TextEncoder();
            const dataToHash = encoder.encode(finalPayload);
            const hashBuffer = await crypto.subtle.digest('SHA-256', dataToHash);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            const blob = new Blob([finalPayload], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = \`KORE_BACKUP_\${wantsEncryption ? 'ENCRYPTED_' : ''}\${new Date().toISOString().split('T')[0]}_[\${hashHex.substring(0,8)}].json\`;`;

const newCrypto = `            let hashString = "hash";
            try {
                if (window.crypto && crypto.subtle) {
                    const encoder = new TextEncoder();
                    const dataToHash = encoder.encode(finalPayload);
                    const hashBuffer = await crypto.subtle.digest('SHA-256', dataToHash);
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    hashString = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 8);
                }
            } catch(e) {}
            
            const blob = new Blob([finalPayload], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = \`KORE_BACKUP_\${wantsEncryption ? 'ENCRYPTED_' : ''}\${new Date().toISOString().split('T')[0]}_[\${hashString}].json\`;`;

content = content.replace(oldCrypto, newCrypto);
fs.writeFileSync(file, content, 'utf8');
console.log("Fixed crypto digest");
