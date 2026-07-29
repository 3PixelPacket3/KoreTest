const fs = require('fs');
let content = fs.readFileSync('Kore/macros.html', 'utf8');

if (content.includes('@media (max-width: 1023px) {') && !content.includes('.hero-overlay .btn-primary { width: 100%; }')) {
    content = content.replace(
        /@media \(max-width: 1023px\) \{/,
        '@media (max-width: 1023px) {\n    .hero-overlay .btn-primary { width: 100%; justify-content: center; }\n'
    );
    fs.writeFileSync('Kore/macros.html', content);
    console.log('Fixed macros hero button width on mobile');
}
