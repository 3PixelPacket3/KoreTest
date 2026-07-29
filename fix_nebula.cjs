const fs = require('fs');
const path = require('path');
const file = path.join('.', 'Kore', 'nebula.html');
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/document\.querySelector\('\\[data-tab=\\\\'html\\\\'\\]'\)/g, "document.querySelector('[data-tab=\\'html\\']')");
// wait, the exact string is:
// onclick="document.querySelector('[data-tab=\\'html\\']').click()"
content = content.replace(/onclick="document\.querySelector\('\[data-tab=\\\\'html\\\\'\]'\)\.click\(\)"/g, "onclick=\"document.querySelector('[data-tab=&quot;html&quot;]').click()\"");

// Let's just do a simpler replace.
content = content.replace("document.querySelector('[data-tab=\\'html\\']').click()", "document.querySelector('[data-tab=&quot;html&quot;]').click()");

fs.writeFileSync(file, content, 'utf8');
