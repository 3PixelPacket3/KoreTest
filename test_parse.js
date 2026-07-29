async function foo() {
    if (!await uiConfirm("hello")) { return; }
}
