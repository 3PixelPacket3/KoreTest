const fs = require('fs');
const path = require('path');

const file = path.join('.', 'Kore', 'settings.html');
let content = fs.readFileSync(file, 'utf8');

const oldLogic = `        document.getElementById('exportTrackerCsvBtn').addEventListener('click', async () => {
            const items = await loadCloudData('work_items') || JSON.parse(localStorage.getItem('kore_work_items')) || [];
            if(items.length === 0) return alert('No active records found to export.');

            const headers = ['Ticket ID', 'Title', 'Status', 'Due Date', 'Creation Date', 'Account', 'Notes'];
            const csvRows = items.map(i => {
                const escapeStr = (str) => \`"\${(str || '').replace(/"/g, '""')}"\`;
                return [
                    escapeStr(i.id), escapeStr(i.title), escapeStr(i.status),
                    escapeStr(i.dueDate), escapeStr(i.created), escapeStr(i.account), escapeStr(i.notes)
                ].join(',');
            });
            
            const csvString = [headers.join(','), ...csvRows].join('\\n');
            
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = \`Kore_Tracker_Historical_\${new Date().toISOString().split('T')[0]}.csv\`;
            a.click();
            
            setTimeout(() => {
                alert('Export generated successfully.');
            }, 500); 
        });`;

const newLogic = `        document.getElementById('exportTrackerCsvBtn').addEventListener('click', async () => {
            try {
                let items = await loadCloudData('work_items');
                if (!items) {
                    try {
                        const local = localStorage.getItem('kore_work_items');
                        items = local ? JSON.parse(local) : [];
                    } catch (e) {
                        items = [];
                    }
                }
                if (!Array.isArray(items)) {
                    // Try extracting if it's stored differently
                    items = Object.values(items);
                }
                if(items.length === 0) return alert('No active records found to export.');

                const headers = ['Ticket ID', 'Title', 'Status', 'Due Date', 'Creation Date', 'Account', 'Notes'];
                const csvRows = items.map(i => {
                    const escapeStr = (str) => \`"\${(str || '').replace(/"/g, '""')}"\`;
                    return [
                        escapeStr(i.id), escapeStr(i.title), escapeStr(i.status),
                        escapeStr(i.dueDate), escapeStr(i.created), escapeStr(i.account), escapeStr(i.notes)
                    ].join(',');
                });
                
                const csvString = [headers.join(','), ...csvRows].join('\\n');
                
                const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = \`Kore_Tracker_Historical_\${new Date().toISOString().split('T')[0]}.csv\`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                setTimeout(() => {
                    alert('Export generated successfully.');
                }, 500); 
            } catch (e) {
                console.error(e);
                alert('Error generating CSV export: ' + e.message);
            }
        });`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync(file, content, 'utf8');
console.log("Fixed CSV logic");
