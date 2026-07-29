const fs = require('fs');
let content = fs.readFileSync('Kore/about.html', 'utf8');

content = content.replace(
    "div.style.display = 'flex'; div.style.gap = '12px'; div.style.marginBottom = '12px'; div.style.alignItems = 'flex-start';",
    "div.className = 'note-field-row';"
);

content = content.replace(
    "@media (max-width: 1023px) {",
    ".note-field-row { display: flex; gap: 12px; margin-bottom: 12px; align-items: flex-start; }\n        @media (max-width: 1023px) {\n    .note-field-row { flex-direction: column !important; }\n    .note-date-input { width: 100% !important; }\n    .note-field-row > div:last-child { flex-direction: row !important; }\n"
);

fs.writeFileSync('Kore/about.html', content);
console.log('Fixed addNoteField mobile layout');
