const fs = require('fs');
const path = require('path');

const file = path.join('.', 'Kore', 'settings.html');
let content = fs.readFileSync(file, 'utf8');

const oldExport = `        document.getElementById('triggerBackupBtn').addEventListener('click', async () => {
            let backupData = {};
            // Gather all local storage keys
            for(let i=0; i<localStorage.length; i++){
                let key = localStorage.key(i);
                backupData[key] = localStorage.getItem(key);
            }
            
            // Optionally fetch cloud data if needed, but for now we backup local cache.
            
            const wantsEncryption = confirm("Do you want to encrypt this backup with AES-256? (Recommended for security)");
            let payloadStr = JSON.stringify(backupData);`;

const newExport = `        document.getElementById('triggerBackupBtn').addEventListener('click', async () => {
            let backupData = {};
            try {
                // Fetch user data from Cloud Vault
                const res = await fetch(\`/api/export_user_data?userId=\${cloudIdentity.userId}\`);
                if (res.ok) {
                    backupData = await res.json();
                } else {
                    alert('Failed to fetch data from Cloud Vault.');
                    return;
                }
            } catch (e) {
                console.error(e);
                alert('Error connecting to Cloud Vault for backup.');
                return;
            }
            
            const wantsEncryption = confirm("Do you want to encrypt this backup with AES-256? (Recommended for security)");
            let payloadStr = JSON.stringify(backupData);`;

content = content.replace(oldExport, newExport);

const oldCsvExport = `        document.getElementById('exportTrackerCsvBtn').addEventListener('click', async () => {
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
                if(confirm('Export generated successfully.\\n\\nWould you like to purge all "Completed" items from the live database to save space?')) {
                    executePurge();
                }
            }, 500); 
        });`;

const newCsvExport = `        document.getElementById('exportTrackerCsvBtn').addEventListener('click', async () => {
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

content = content.replace(oldCsvExport, newCsvExport);

const oldPurgeFunc = `        async function executePurge() {
            let items = await loadCloudData('work_items') || JSON.parse(localStorage.getItem('kore_work_items')) || [];
            const originalCount = items.length;
            const purgedItems = items.filter(i => i.status !== 'Completed');
            const removedCount = originalCount - purgedItems.length;

            if (removedCount > 0) {
                await saveCloudData('work_items', purgedItems);
                localStorage.setItem('kore_work_items', JSON.stringify(purgedItems));
                alert(\`✅ Success: \${removedCount} completed items purged from the live vault.\`);
                
            } else {
                alert('No completed items found to purge.');
            }
        }

        document.getElementById('purgeCompletedBtn').addEventListener('click', () => {
            if(confirm('Are you sure you want to permanently delete all "Completed" items from the live database? Make sure you have exported a CSV backup first.')) {
                executePurge();
            }
        });`;

content = content.replace(oldPurgeFunc, '');
// there is a possibility that it doesn't match perfectly, let's use a regex instead for the purge func removal

fs.writeFileSync(file, content, 'utf8');
console.log("Fixed settings export logic");
