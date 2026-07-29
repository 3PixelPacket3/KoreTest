const fs = require('fs');
const path = require('path');

const file = path.join('.', 'server.ts');
let content = fs.readFileSync(file, 'utf8');

const newEndpoint = `
// GET /api/export_user_data
app.get('/api/export_user_data', (req, res) => {
    try {
        const userId = req.query.userId as string;
        if (!userId) return res.status(400).send("Missing userId");

        const backup: any = { userData: [], workItems: [], infoHub: [], macros: [] };

        // 1. User Data
        for (const [key, value] of userDataStore.entries()) {
            if (key.startsWith(userId + '::')) {
                backup.userData.push([key, value]);
            }
        }

        // 2. Work Items
        if (workItemsStore.has(userId)) {
            backup.workItems = Array.from(workItemsStore.get(userId)!.entries());
        }

        // 3. Info Hub (Personal pages are stored with partition key = userId)
        if (infoHubStore.has(userId)) {
            backup.infoHub = Array.from(infoHubStore.get(userId)!.entries());
        }

        // 4. Macros (Personal macros)
        if (macrosStore.has(userId)) {
            backup.macros = Array.from(macrosStore.get(userId)!.entries());
        }

        res.set(NO_CACHE_HEADERS).status(200).json(backup);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});
`;

if (!content.includes('/api/export_user_data')) {
    content = content.replace('// Backup Endpoints', '// Backup Endpoints' + newEndpoint);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Added /api/export_user_data");
} else {
    console.log("Already added");
}
