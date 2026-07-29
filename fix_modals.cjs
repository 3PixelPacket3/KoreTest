const fs = require('fs');
const path = require('path');
const dir = './Kore';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add modal-content max width
    if (content.includes('@media (max-width: 1023px) {') && !content.includes('.modal-content { max-width: 95vw !important; }')) {
        content = content.replace(
            /@media \(max-width: 1023px\) \{/,
            '@media (max-width: 1023px) {\n    .modal-content, .system-modal, .storage-tracker { max-width: 95vw !important; }\n'
        );
        fs.writeFileSync(filePath, content);
        console.log(`Updated modals in ${file}`);
    }
});
