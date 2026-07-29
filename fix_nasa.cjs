const fs = require('fs');
let content = fs.readFileSync('Kore/index.html', 'utf8');
content = content.replace(
    'if(data.hdurl || data.url) {',
    'if(data.media_type === "image" && (data.hdurl || data.url)) {'
);
fs.writeFileSync('Kore/index.html', content);
console.log('Fixed NASA APOD video issue');
