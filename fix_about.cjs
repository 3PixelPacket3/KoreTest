const fs = require('fs');
let content = fs.readFileSync('Kore/about.html', 'utf8');

// Fix admin-edit-btn on mobile
if (content.includes('@media (max-width: 1023px) {') && !content.includes('.admin-edit-btn { position: relative; top: 0; right: 0; margin-bottom: 16px; display: block; width: 100%; }')) {
    content = content.replace(
        '@media (max-width: 1023px) {',
        '@media (max-width: 1023px) {\n    .admin-edit-btn { position: static !important; margin-bottom: 16px; width: 100%; }\n    .content { word-break: break-word; overflow-x: auto; }\n'
    );
}

// Add word-break to .content in general
content = content.replace(
    '.content { font-size: 1.05rem; line-height: 1.6; color: var(--text-main);}',
    '.content { font-size: 1.05rem; line-height: 1.6; color: var(--text-main); word-break: break-word; overflow-x: auto; }'
);

fs.writeFileSync('Kore/about.html', content);
console.log('Fixed about.html edit btn and content wrapping');
