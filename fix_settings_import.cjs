const fs = require('fs');
const path = require('path');

const file = path.join('.', 'Kore', 'settings.html');
let content = fs.readFileSync(file, 'utf8');

const oldImportLogic = `                    let count = 0;
                    for (let key in data) {
                        if (data.hasOwnProperty(key)) {
                            localStorage.setItem(key, data[key]);
                            
                            // Map local keys to cloud types for migration
                            let type = null;
                            if (key === 'kore_work_items') type = 'work_items';
                            else if (key === 'kore_tasks') type = 'tasks';
                            else if (key === 'kore_info_pages') type = 'info_pages';
                            else if (key === 'kore_global_notepad') type = 'notepad';
                            else if (key === 'kore_shortcuts') type = 'shortcuts';
                            else if (key === 'kore_categories') type = 'categories';
                            else if (key === 'kore_identity') type = 'identity';
                            
                            if (type) {
                                try {
                                    let parsedData = (typeof data[key] === 'string' && (data[key].startsWith('[') || data[key].startsWith('{'))) ? JSON.parse(data[key]) : data[key];
                                    await saveCloudData(type, parsedData);
                                } catch(e) {
                                    console.error('Error migrating ' + key + ' to cloud', e);
                                }
                            }
                            count++;
                        }
                    }
                    alert(\`✅ Successfully restored \${count} records and migrated applicable data to your Cloud Vault.\`);
                    
                    location.reload(); `;

const newImportLogic = `                    if (data.userData || data.workItems || data.infoHub || data.macros) {
                        // It's a cloud backup format
                        try {
                            const res = await fetch(\`/api/import_user_data?userId=\${cloudIdentity.userId}\`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(data)
                            });
                            if (res.ok) {
                                alert('✅ Successfully restored Cloud Vault backup.');
                                location.reload();
                            } else {
                                alert('❌ Failed to restore Cloud Vault backup.');
                            }
                        } catch (e) {
                            alert('❌ Error communicating with Cloud Vault.');
                        }
                    } else {
                        // Legacy local storage backup
                        let count = 0;
                        for (let key in data) {
                            if (data.hasOwnProperty(key)) {
                                localStorage.setItem(key, data[key]);
                                
                                // Map local keys to cloud types for migration
                                let type = null;
                                if (key === 'kore_work_items') type = 'work_items';
                                else if (key === 'kore_tasks') type = 'tasks';
                                else if (key === 'kore_info_pages') type = 'info_pages';
                                else if (key === 'kore_global_notepad') type = 'notepad';
                                else if (key === 'kore_shortcuts') type = 'shortcuts';
                                else if (key === 'kore_categories') type = 'categories';
                                else if (key === 'kore_identity') type = 'identity';
                                
                                if (type) {
                                    try {
                                        let parsedData = (typeof data[key] === 'string' && (data[key].startsWith('[') || data[key].startsWith('{'))) ? JSON.parse(data[key]) : data[key];
                                        await saveCloudData(type, parsedData);
                                    } catch(e) {}
                                }
                                count++;
                            }
                        }
                        alert(\`✅ Successfully restored \${count} legacy local records to your Cloud Vault.\`);
                        location.reload();
                    }`;

content = content.replace(oldImportLogic, newImportLogic);
fs.writeFileSync(file, content, 'utf8');
console.log("Fixed JSON import");
