const fs = require('fs');
let content = fs.readFileSync('Kore/index.html', 'utf8');

const replacement = `
@media (max-width: 1023px) {
    .dashboard-grid {
        display: flex !important;
        flex-direction: column !important;
    }
    .left-col, .right-col {
        display: contents !important;
    }
    .system-bulletin {
        order: -1 !important;
        margin-top: 0 !important;
    }
`;
if (content.includes('@media (max-width: 1023px) {') && !content.includes('.system-bulletin { order: -1 !important; }')) {
    content = content.replace('@media (max-width: 1023px) {', replacement);
    fs.writeFileSync('Kore/index.html', content);
    console.log('Fixed index.html system bulletin on mobile');
}
