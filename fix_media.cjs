const fs = require('fs');
const path = require('path');
const dir = './Kore';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('img, video { max-width: 100%; height: auto; }')) {
        content = content.replace('img, video { max-width: 100%; height: auto; }', 'img, video, iframe, canvas { max-width: 100%; height: auto; }');
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file} media types.`);
    }
});
