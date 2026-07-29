const { parse } = require('acorn');
try {
    parse("function foo() { if (await uiConfirm('test')) return; }", { ecmaVersion: 2022, sourceType: 'script' });
} catch(e) { console.log(e.message); }
