const fs = require('fs');
let content = fs.readFileSync('Kore/index.html', 'utf8');
content = content.replace(
    "document.getElementById('live-time').textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });",
    "document.getElementById('live-time').textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });\n            document.getElementById('live-date').textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });"
);
fs.writeFileSync('Kore/index.html', content);
console.log('Fixed index.html clock fallback');
