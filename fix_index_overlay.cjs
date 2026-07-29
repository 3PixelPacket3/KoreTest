const fs = require('fs');
let content = fs.readFileSync('Kore/index.html', 'utf8');

if (content.includes('.hero-overlay { \n            position: absolute;')) {
    content = content.replace(
        '.hero-overlay { \n            position: absolute; \n            bottom: 0; \n            left: 0; \n            width: 100%; \n            background: linear-gradient(to top, rgba(15, 23, 42, 0.85), transparent); \n            padding: 30px; \n            box-sizing: border-box; \n            color: white; \n            display: flex; \n            justify-content: space-between; \n            align-items: flex-end;\n        }',
        '.hero-overlay { position: absolute; bottom: 0; left: 0; width: 100%; background: linear-gradient(to top, rgba(15, 23, 42, 0.85), transparent); padding: 30px; box-sizing: border-box; color: white; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px; }'
    );
    fs.writeFileSync('Kore/index.html', content);
    console.log('Fixed index.html hero overlay wrap');
}
