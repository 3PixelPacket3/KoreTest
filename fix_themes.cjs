const fs = require('fs');
const path = require('path');

const dir = path.join('.', 'Kore');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const themeCSS = `
        /* THEME: Midnight Dark */
        body[data-theme="midnight"] {
            --bg-app: #0f172a; --bg-surface: #1e293b; --text-main: #f8fafc; --text-secondary: #94a3b8;
            --border-subtle: #334155; --accent-primary: #38bdf8; --accent-hover: #7dd3fc;
            --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.5); --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
        }
        /* THEME: Cyberpunk */
        body[data-theme="cyberpunk"] {
            --bg-app: #000000; --bg-surface: #121212; --text-main: #00ff41; --text-secondary: #ff00ff;
            --border-subtle: #00ff41; --accent-primary: #ff00ff; --accent-hover: #ff00aa;
            --radius-md: 0px; --radius-sm: 0px; --shadow-sm: 0 0 5px rgba(0, 255, 65, 0.2);
            --shadow-md: 0 0 10px rgba(255, 0, 255, 0.2);
        }
        /* THEME: Corporate Classic */
        body[data-theme="corporate"] {
            --bg-app: #e2e8f0; --bg-surface: #ffffff; --text-main: #1e293b; --text-secondary: #475569;
            --border-subtle: #cbd5e1; --accent-primary: #1d4ed8; --accent-hover: #1e40af;
            --radius-md: 4px; --radius-sm: 2px;
        }
        /* THEME: Earthy Minimal */
        body[data-theme="earthy"] {
            --bg-app: #fdf8f5; --bg-surface: #ffffff; --text-main: #3f3e3a; --text-secondary: #6b7280;
            --border-subtle: #e5e5e5; --accent-primary: #5c7f67; --accent-hover: #4a6652;
            --radius-md: 24px; --radius-sm: 16px;
        }
        /* THEME: Oceanic */
        body[data-theme="oceanic"] {
            --bg-app: #e0f2fe; --bg-surface: #f0f9ff; --text-main: #0c4a6e; --text-secondary: #0369a1;
            --border-subtle: #bae6fd; --accent-primary: #0284c7; --accent-hover: #0369a1;
            --radius-md: 16px; --radius-sm: 12px;
        }
`;

const themeScript = `
<body>
<script>
    // Theme Initializer to prevent flash on load
    const savedTheme = localStorage.getItem('kore_theme') || 'default';
    if(savedTheme !== 'default') {
        document.body.setAttribute('data-theme', savedTheme);
    }
</script>`;

let changed = 0;
for (const f of files) {
    const filePath = path.join(dir, f);
    let content = fs.readFileSync(filePath, 'utf8');

    let modified = false;

    // Check if themes CSS exists
    if (!content.includes('THEME: Midnight Dark')) {
        // Insert before 'body {' inside <style>
        content = content.replace(/(?:\s*)body\s*\{\s*margin:/, themeCSS + '\n        body {\n            margin:');
        modified = true;
    }

    // Check if script exists
    if (!content.includes('Theme Initializer to prevent flash on load')) {
        // Replace <body> with <body> + script
        content = content.replace(/<body>/, themeScript);
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        changed++;
        console.log("Updated", f);
    }
}
console.log("Changed files:", changed);
