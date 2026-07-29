const fs = require('fs');
const path = require('path');

const file = path.join('.', 'server.ts');
let content = fs.readFileSync(file, 'utf8');

const importEndpoint = `
// POST /api/import_user_data
app.post('/api/import_user_data', (req, res) => {
    try {
        const userId = req.query.userId as string;
        if (!userId) return res.status(400).send("Missing userId");

        const backup = req.body;

        // 1. User Data
        if (backup.userData) {
            backup.userData.forEach(([k, v]: any) => {
                if (k.startsWith(userId + '::')) {
                    userDataStore.set(k, v);
                }
            });
        }

        // 2. Work Items
        if (backup.workItems) {
            if (!workItemsStore.has(userId)) workItemsStore.set(userId, new Map());
            backup.workItems.forEach(([id, item]: any) => workItemsStore.get(userId)!.set(id, item));
        }

        // 3. Info Hub
        if (backup.infoHub) {
            if (!infoHubStore.has(userId)) infoHubStore.set(userId, new Map());
            backup.infoHub.forEach(([id, item]: any) => infoHubStore.get(userId)!.set(id, item));
        }

        // 4. Macros
        if (backup.macros) {
            if (!macrosStore.has(userId)) macrosStore.set(userId, new Map());
            backup.macros.forEach(([id, item]: any) => macrosStore.get(userId)!.set(id, item));
        }

        res.set(NO_CACHE_HEADERS).status(200).json({ status: "success" });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});
`;

if (!content.includes('/api/import_user_data')) {
    content = content.replace('// GET /api/get_user_data', importEndpoint + '\n// GET /api/get_user_data');
    fs.writeFileSync(file, content, 'utf8');
    console.log("Added /api/import_user_data");
} else {
    console.log("Already added");
}
