const { parse } = require('acorn');
try {
    parse("document.getElementById('btn').addEventListener('click', () => { if (await uiConfirm('test')) return; });", { ecmaVersion: 2022, sourceType: 'script' });
} catch(e) { console.log(e.message); }
