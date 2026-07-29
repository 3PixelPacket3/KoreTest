const fs = require('fs');
const content = fs.readFileSync('Kore/lod.html', 'utf8');
const scriptMatch = content.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)[1];
const inner = scriptMatch.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i)[1];
fs.writeFileSync('lod_script.js', inner);
