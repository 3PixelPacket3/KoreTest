const fs = require('fs');
const path = require('path');
const dir = './Kore';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const mobileNavCss = `
    .nav-item {
        padding: 15px 20px;
        border-bottom: 1px solid var(--border-subtle);
        width: 100%;
        flex-wrap: wrap;
        height: auto;
    }
    .nav-item:last-child {
        border-bottom: none;
    }
    .dropdown-content {
        position: static;
        display: none;
        box-shadow: none;
        border: none;
        border-radius: 0;
        width: 100%;
        padding-left: 20px;
        margin-top: 10px;
    }
    .nav-item.open-mobile .dropdown-content {
        display: block !important;
    }
    /* Hide hover effects on mobile */
    .nav-item:hover .dropdown-content, 
    .nav-item:focus-within .dropdown-content,
    .nav-item:active .dropdown-content {
        display: none;
    }
    .nav-item.open-mobile:hover .dropdown-content,
    .nav-item.open-mobile:focus-within .dropdown-content,
    .nav-item.open-mobile:active .dropdown-content {
        display: block !important;
    }
`;

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
    
    // Replace the CSS
    const cssRegex = /\.nav-item \{\s*padding: 15px 20px;[\s\S]*?\.nav-item:active \.dropdown-content \{\s*display: block;\s*\}/;
    if (cssRegex.test(content)) {
        content = content.replace(cssRegex, mobileNavCss.trim());
    } else {
        console.log(`Could not find CSS to replace in ${file}`);
    }
    
    // Inject the JS
    if (!content.includes('Mobile Nav Script (Injected)')) {
        content = content.replace('</body>', jsToInject);
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated nav in ${file}`);
});
