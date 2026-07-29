const fs = require('fs');
let content = fs.readFileSync('Kore/about.html', 'utf8');

content = content.replace(
    '.note-field-row { flex-direction: column !important; }',
    '.note-field-row { flex-direction: column !important; }\n    .note-text-input { width: 100% !important; }\n    .note-field-row > div:first-child { width: 100% !important; }'
);

fs.writeFileSync('Kore/about.html', content);
console.log('Fixed addNoteField mobile layout more');
