const fs = require('fs');
const path = require('path');
const dir = './Kore';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const jsToInject = `
<!-- Mobile Nav Script (Injected) -->
<script>
document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.querySelector('.dropdown-content')) {
            item.addEventListener('click', (e) => {
                if (window.innerWidth <= 1023) {
                    if (e.target.tagName.toLowerCase() === 'a' && e.target.closest('.dropdown-content')) {
                        return;
                    }
                    e.preventDefault();
                    item.classList.toggle('open-mobile');
                }
            });
        }
    });
});
</script>
</body>`;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // First, remove the previously injected script block (and the </body> it was attached to)
    const injectedRegex = /<!-- Mobile Nav Script \(Injected\) -->\s*<script>[\s\S]*?<\/script>\s*<\/body>/g;
    
    let hadInjected = false;
    if (injectedRegex.test(content)) {
        content = content.replace(injectedRegex, '</body>');
        hadInjected = true;
    }
    
    // Now, find the LAST </body> in the file and replace it
    if (hadInjected) {
        const lastBodyIndex = content.lastIndexOf('</body>');
        if (lastBodyIndex !== -1) {
            content = content.substring(0, lastBodyIndex) + jsToInject + content.substring(lastBodyIndex + 7);
            fs.writeFileSync(filePath, content);
            console.log(`Fixed script placement in ${file}`);
        }
    }
});
