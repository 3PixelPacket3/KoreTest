const fs = require('fs');
let content = fs.readFileSync('Kore/passwords.html', 'utf8');
content = content.replace(
    '<textarea id="pwOutput" class="output-box" readonly aria-label="Generated password" rows="2" style="resize: none; word-break: break-all; overflow: hidden; display: flex; align-items: center; justify-content: center; min-height: 80px;"></textarea>',
    '<textarea id="pwOutput" class="output-box" readonly aria-label="Generated password" rows="3" style="resize: none; word-break: break-all; overflow-y: auto; min-height: 120px;"></textarea>'
);
fs.writeFileSync('Kore/passwords.html', content);
console.log('Fixed passwords.html output box');
