const fs = require('fs');
let content = fs.readFileSync('Kore/lod.html', 'utf8');
content = content.replace("return html.join('') + '</tbody></table></div>\\n\\n</body></html>';", "return html.join('') + '</tbody></table></div></body></html>';");
content = content.replace("return html.join('') + '</tbody></table></div>\\\n\n</body></html>';", "return html.join('') + '</tbody></table></div></body></html>';");
content = content.replace("return html.join('') + '</tbody></table></div>\\\r\n\r\n</body></html>';", "return html.join('') + '</tbody></table></div></body></html>';");
fs.writeFileSync('Kore/lod.html', content);
