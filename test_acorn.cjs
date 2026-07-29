const { parse } = require('acorn');
try {
    parse("function foo() { if (await uiConfirm('test')) return; }", { ecmaVersion: 2022, sourceType: 'script' });
    console.log("Parsed script successfully");
} catch(e) { console.log(e.message); }
try {
    parse("function foo() { if (await uiConfirm('test')) return; }", { ecmaVersion: 2022, sourceType: 'module' });
    console.log("Parsed module successfully");
} catch(e) { console.log(e.message); }
