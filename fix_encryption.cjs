const fs = require('fs');
const path = require('path');

const file = path.join('.', 'Kore', 'settings.html');
let content = fs.readFileSync(file, 'utf8');

const oldEnc = `            if (wantsEncryption) {
                const password = prompt("Enter a strong password to encrypt the backup:");
                if (!password) { alert("Backup cancelled."); return; }
                const enc = new TextEncoder();
                const salt = crypto.getRandomValues(new Uint8Array(16));
                const iv = crypto.getRandomValues(new Uint8Array(12));
                const key = await deriveKey(password, salt);
                const encrypted = await crypto.subtle.encrypt({name: "AES-GCM", iv: iv}, key, enc.encode(payloadStr));
                
                finalPayload = JSON.stringify({
                    _kore_encrypted: true,
                    salt: Array.from(salt),
                    iv: Array.from(iv),
                    data: Array.from(new Uint8Array(encrypted))
                });
            }`;

const newEnc = `            if (wantsEncryption) {
                if (!window.crypto || !crypto.subtle) {
                    alert("Encryption is not supported in this browser environment. Downloading unencrypted.");
                } else {
                    const password = prompt("Enter a strong password to encrypt the backup:");
                    if (!password) { alert("Backup cancelled."); return; }
                    try {
                        const enc = new TextEncoder();
                        const salt = crypto.getRandomValues(new Uint8Array(16));
                        const iv = crypto.getRandomValues(new Uint8Array(12));
                        const key = await deriveKey(password, salt);
                        const encrypted = await crypto.subtle.encrypt({name: "AES-GCM", iv: iv}, key, enc.encode(payloadStr));
                        
                        finalPayload = JSON.stringify({
                            _kore_encrypted: true,
                            salt: Array.from(salt),
                            iv: Array.from(iv),
                            data: Array.from(new Uint8Array(encrypted))
                        });
                    } catch(e) {
                        alert("Encryption failed. Downloading unencrypted.");
                        finalPayload = payloadStr;
                        wantsEncryption = false;
                    }
                }
            }`;
            
content = content.replace(oldEnc, newEnc);
fs.writeFileSync(file, content, 'utf8');
console.log("Fixed encryption");
