const fs = require('fs');
const path = require('path');

const dir = './Kore';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');

    // 1. Remove CSS for Copilot
    // Find everything from /* --- Kore Copilot AI Chat --- */ or /* --- AI Copilot Styles --- */ 
    // down to /* --- FLOATING COMMAND PALETTE NOTEPAD --- */ or the end of style tag.
    content = content.replace(/\/\*\s*---\s*(?:Kore )?(?:AI )?Copilot(?: AI Chat| Styles)?\s*---\s*\*\/[\s\S]*?(?=\/\*\s*---|\<\/style\>)/ig, '');

    // 2. Remove HTML for Copilot
    // from <button class="copilot-trigger" ... to </div></div> or </footer>
    // Actually, looking at the HTML, we can match:
    // <button class="copilot-trigger".*?</form>\s*</div>
    content = content.replace(/<button class="copilot-trigger"[^>]*>[\s\S]*?<\/button>\s*<div class="copilot-window"[^>]*>[\s\S]*?<\/form>\s*<\/div>/g, '');

    // 3. Remove JS for Copilot
    // // --- Copilot NLP System --- or // --- AI Copilot Interactions --- or // --- Copilot Integration ---
    // down to the next // --- or async function loadData() or </script>
    content = content.replace(/\/\/\s*---\s*(?:Kore )?(?:AI )?Copilot(?:.*?)\s*---\s*[\s\S]*?(?=\/\/\s*---|\b(?:async )?function [a-zA-Z0-9_]+\(|\<\/script\>)/ig, '');
    
    // Some stray toggleCopilot?
    content = content.replace(/setTimeout\(\(\) => \{ toggleCopilot\(\); \}, \d+\);/g, '');

    fs.writeFileSync(path.join(dir, file), content, 'utf8');
});
console.log("Copilot removed.");
