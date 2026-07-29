const fs = require('fs');
let html = fs.readFileSync('Kore/product-html.html', 'utf8');

const targetStr = '<p class="note">Download the template, fill one row per item, save as CSV, upload, then generate. The output will download instantly as a new CSV.</p>';
const replacementStr = targetStr + '\n            <p class="note" style="color: #ef4444; font-weight: 600; margin-top: 8px;">⚠️ Warning: Please double-check all files before using in the Product HTML Converter.</p>';

if (html.includes(targetStr)) {
    html = html.replace(targetStr, replacementStr);
    fs.writeFileSync('Kore/product-html.html', html);
    console.log("Success");
} else {
    console.log("Target string not found in Kore/product-html.html");
}
