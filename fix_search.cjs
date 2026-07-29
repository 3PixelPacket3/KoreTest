const fs = require('fs');
const path = require('path');

const file = path.join('.', 'Kore', 'index.html');
let content = fs.readFileSync(file, 'utf8');

const oldLogic = `                    // Search localTickets (Work Items)
                    if (localTickets) {
                        localTickets.forEach(t => {
                            if ((t.title && t.title.toLowerCase().includes(query)) || (t.id && t.id.toLowerCase().includes(query))) {
                                results.push({
                                    title: t.title,
                                    meta: \`Work Item • \${t.id} • \${t.status}\`,
                                    url: \`work.html\`
                                });
                            }
                        });
                    }
                    
                    // Search Info Hub Pages via API
                    const infoRes = await fetch(\`/api/get_info_pages?userId=\${cloudIdentity.userId}\`);
                    if (infoRes.ok) {
                        const infoPages = await infoRes.json();
                        infoPages.forEach(p => {
                            if ((p.title && p.title.toLowerCase().includes(query)) || (p.content && p.content.toLowerCase().includes(query))) {
                                results.push({
                                    title: p.title,
                                    meta: \`Info Hub \${p.isGlobal ? '(Global)' : '(Personal)'}\`,
                                    url: \`info-page.html?id=\${p.id}\`
                                });
                            }
                        });
                    }

                    // Search Macros via API
                    const macrosRes = await fetch(\`/api/get_macros?userId=\${cloudIdentity.userId}\`);
                    if (macrosRes.ok) {
                        const macros = await macrosRes.json();
                        macros.forEach(m => {
                            if ((m.title && m.title.toLowerCase().includes(query)) || (m.content && m.content.toLowerCase().includes(query))) {
                                results.push({
                                    title: m.title,
                                    meta: \`Macro \${m.isGlobal ? '(Global)' : '(Personal)'}\`,
                                    url: \`macros.html\`
                                });
                            }
                        });
                    }`;

const newLogic = `                    // Search localTickets (Work Items)
                    if (localTickets) {
                        localTickets.forEach(t => {
                            if ((t.title && t.title.toLowerCase().includes(query)) || (t.id && t.id.toLowerCase().includes(query)) || (t.notes && t.notes.toLowerCase().includes(query))) {
                                results.push({
                                    title: t.title,
                                    meta: \`Work Item • \${t.id} • \${t.status}\`,
                                    url: \`work.html\`
                                });
                            }
                        });
                    }
                    
                    // Search localTasks (Todos)
                    if (localTasks) {
                        localTasks.forEach(t => {
                            if ((t.text && t.text.toLowerCase().includes(query))) {
                                results.push({
                                    title: t.text,
                                    meta: \`To-Do • \${t.priority}\`,
                                    url: \`todo.html\`
                                });
                            }
                        });
                    }
                    
                    // Search Document Library
                    try {
                        const docsRes = await fetch(\`/api/get_user_data?userId=\${cloudIdentity.userId}&dataType=document_library\`);
                        if (docsRes.ok) {
                            const docs = await docsRes.json();
                            if (Array.isArray(docs)) {
                                docs.forEach(d => {
                                    if ((d.name && d.name.toLowerCase().includes(query))) {
                                        results.push({
                                            title: d.name,
                                            meta: \`Document Library\`,
                                            url: \`docs.html\`
                                        });
                                    }
                                });
                            }
                        }
                    } catch(e) {}
                    try {
                        const docsGlobalRes = await fetch(\`/api/get_user_data?userId=GLOBAL_DOCS&dataType=document_library\`);
                        if (docsGlobalRes.ok) {
                            const docsG = await docsGlobalRes.json();
                            if (Array.isArray(docsG)) {
                                docsG.forEach(d => {
                                    if ((d.name && d.name.toLowerCase().includes(query))) {
                                        results.push({
                                            title: d.name,
                                            meta: \`Document Library (Global)\`,
                                            url: \`docs.html\`
                                        });
                                    }
                                });
                            }
                        }
                    } catch(e) {}

                    // Search Info Hub Pages via API
                    try {
                        const infoRes = await fetch(\`/api/get_info_pages?userId=\${cloudIdentity.userId}\`);
                        if (infoRes.ok) {
                            const infoPages = await infoRes.json();
                            infoPages.forEach(p => {
                                if ((p.title && p.title.toLowerCase().includes(query)) || (p.content && p.content.toLowerCase().includes(query))) {
                                    results.push({
                                        title: p.title,
                                        meta: \`Info Hub \${p.isGlobal ? '(Global)' : '(Personal)'}\`,
                                        url: \`info-page.html?id=\${p.id}\`
                                    });
                                }
                            });
                        }
                    } catch(e) {}

                    // Search Macros via API
                    try {
                        const macrosRes = await fetch(\`/api/get_macros?userId=\${cloudIdentity.userId}\`);
                        if (macrosRes.ok) {
                            const macros = await macrosRes.json();
                            macros.forEach(m => {
                                if ((m.title && m.title.toLowerCase().includes(query)) || (m.content && m.content.toLowerCase().includes(query))) {
                                    results.push({
                                        title: m.title,
                                        meta: \`Macro \${m.isGlobal ? '(Global)' : '(Personal)'}\`,
                                        url: \`macros.html\`
                                    });
                                }
                            });
                        }
                    } catch(e) {}
                    
                    // Static App Links
                    const apps = [
                        { title: 'Settings', meta: 'Configuration', url: 'settings.html' },
                        { title: 'About', meta: 'App Info', url: 'about.html' },
                        { title: 'Vulnerability Scanner', meta: 'Security Tool', url: 'scanner.html' },
                        { title: 'File to LOAD Converter', meta: 'Utility Tool', url: 'file-converter.html' },
                        { title: 'Personal To-Do', meta: 'Task Tracker', url: 'todo.html' },
                        { title: 'Work Tracker', meta: 'Ticket Management', url: 'work.html' },
                        { title: 'Macro Library', meta: 'Text Automation', url: 'macros.html' },
                        { title: 'Document Library', meta: 'File Vault', url: 'docs.html' },
                        { title: 'Info Hub', meta: 'Knowledge Base', url: 'info-hub.html' }
                    ];
                    apps.forEach(a => {
                        if (a.title.toLowerCase().includes(query)) {
                            results.push(a);
                        }
                    });`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync(file, content, 'utf8');
console.log("Updated search logic in index.html");
