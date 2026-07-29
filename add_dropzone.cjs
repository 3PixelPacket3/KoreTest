const fs = require('fs');
let html = fs.readFileSync('Kore/product-html.html', 'utf8');

const targetStr = `<input type="file" id="bulkFile" class="input" accept=".csv" onchange="handleBulkFileChange(event)" style="padding: 6px;">
                <small id="bulkStatus" style="font-weight: 600;">No file loaded.</small>`;

const replacementStr = `<div id="bulkDropZone" style="border: 2px dashed var(--border-subtle); border-radius: 8px; padding: 30px 20px; text-align: center; cursor: pointer; transition: all 0.3s ease; background: var(--bg-app); margin-top: 10px;">
                    <input type="file" id="bulkFile" class="input" accept=".csv" onchange="handleBulkFileChange(event)" style="display: none;">
                    <div style="font-size: 2rem; margin-bottom: 12px; color: var(--accent-primary);">📁</div>
                    <p style="margin: 0 0 8px 0; color: var(--text-main); font-weight: 600; font-size: 1.1rem;">Drag and drop your CSV here</p>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 0.95rem;">or <span style="color: var(--accent-primary); text-decoration: underline;">click to browse</span> files</p>
                    <small id="bulkStatus" style="font-weight: 600; display: block; margin-top: 16px; color: var(--text-secondary); padding: 8px; background: var(--bg-surface); border-radius: 6px;">No file loaded.</small>
                </div>`;

if (html.includes(targetStr)) {
    html = html.replace(targetStr, replacementStr);
    
    // add event listener JS
    const jsInsert = `
        const dropZone = document.getElementById('bulkDropZone');
        const fileInput = document.getElementById('bulkFile');
        if (dropZone && fileInput) {
            dropZone.addEventListener('click', () => fileInput.click());
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.style.borderColor = 'var(--accent-primary)';
                dropZone.style.background = 'rgba(14, 165, 233, 0.05)';
            });
            dropZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                dropZone.style.borderColor = 'var(--border-subtle)';
                dropZone.style.background = 'var(--bg-app)';
            });
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.style.borderColor = 'var(--border-subtle)';
                dropZone.style.background = 'var(--bg-app)';
                if (e.dataTransfer.files.length) {
                    fileInput.files = e.dataTransfer.files;
                    handleBulkFileChange({ target: fileInput });
                }
            });
        }
`;
    // Insert JS before </script> at the end
    const lastScriptIdx = html.lastIndexOf('</script>');
    html = html.substring(0, lastScriptIdx) + jsInsert + html.substring(lastScriptIdx);
    
    fs.writeFileSync('Kore/product-html.html', html);
    console.log("Success");
} else {
    console.log("Target string not found.");
}
