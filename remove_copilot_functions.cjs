const fs = require('fs');
const path = require('path');

const dir = './Kore';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');

    content = content.replace(/function toggleCopilot\(\)\s*\{[^}]*\}[^}]*\}/g, function(match) {
        // match might grab too much. 
        return '';
    });
    // Actually, writing a precise regex for arbitrary javascript blocks is hard.
    // Let's use simpler regex:
    
    const funcNames = ['toggleCopilot', 'handleCopilotSubmit', 'appendChatMessage', 'initCopilotData'];
    funcNames.forEach(fn => {
        let regex = new RegExp(`(async )?function ${fn}\\([^)]*\\)\\s*\\{[\\s\\S]*?\\n\\s*\\}`, 'g');
        // this will only match one level of curly braces, which is not enough.
    });
    
    // Instead, let's just grep the starting index of the function and count curly braces.
    funcNames.forEach(fn => {
        while(true) {
            let start = content.indexOf(`function ${fn}(`);
            if (start === -1) {
                start = content.indexOf(`async function ${fn}(`);
            }
            if (start === -1) break;
            
            let i = start;
            while(content[i] !== '{' && i < content.length) i++;
            let braceCount = 1;
            i++;
            while(braceCount > 0 && i < content.length) {
                if (content[i] === '{') braceCount++;
                if (content[i] === '}') braceCount--;
                i++;
            }
            // also remove preceding comments if any
            let s = start;
            while(s > 0 && (content[s-1] === ' ' || content[s-1] === '\n' || content[s-1] === '\r' || content[s-1] === '\t')) s--;
            // naive preceding comment check
            content = content.substring(0, start) + content.substring(i);
        }
    });

    // Remove any leftover copilot phrases inside strings (like greetings)
    content = content.replace(/let copilotMessages = \[\];/g, '');
    content = content.replace(/`Hello, \$\{profileName\}\. I am your Kore Copilot\..*?`/g, '`Hello ${profileName}.`');
    content = content.replace(/\/\*.*?Copilot.*?\*\//ig, '');
    content = content.replace(/\/\/.*?Copilot.*/ig, '');

    fs.writeFileSync(path.join(dir, file), content, 'utf8');
});
console.log("Done.");
