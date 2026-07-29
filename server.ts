import express from 'express';
import path from 'path';
import cors from 'cors';

const app = express();
const PORT = 3000;

// Enable JSON body parsing and CORS
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// Global cache headers
const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "Pragma": "no-cache",
  "Expires": "0"
};

// In-Memory Database Stores
const userDataStore = new Map<string, any>(); // key: `${userId}::${dataType}` -> data
const workItemsStore = new Map<string, Map<string, any>>(); // userId -> (ticketId -> ticket)
const infoHubStore = new Map<string, Map<string, any>>(); // partitionKey -> (pageId -> page)
const macrosStore = new Map<string, Map<string, any>>(); // partitionKey -> (macroId -> macro)
const adminsStore = new Set<string>(['joshua.smolak@envoysolutions.com', 'oharajoshua333@gmail.com']); // Admins table

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mock Azure Static Web Apps Authentication
app.get('/.auth/me', (req, res) => {
  // We mock a realistic email for testing if it's one of the admins
  const email = 'oharajoshua333@gmail.com'; 
  const roles = ['anonymous', 'authenticated'];
  if (adminsStore.has(email)) {
      roles.push('admin');
  }

  res.set(NO_CACHE_HEADERS).json({
    clientPrincipal: {
      identityProvider: 'github',
      userId: 'mock-user-123',
      userDetails: email,
      userRoles: roles
    }
  });
});

// Admin Management Endpoints
app.get('/api/get_admins', (req, res) => {
    res.set(NO_CACHE_HEADERS).status(200).json(Array.from(adminsStore));
});

app.post('/api/add_admin', (req, res) => {
    const { email } = req.body;
    if (email) adminsStore.add(email.toLowerCase());
    res.set(NO_CACHE_HEADERS).status(200).json({ status: "success" });
});

app.post('/api/remove_admin', (req, res) => {
    const { email } = req.body;
    if (email) adminsStore.delete(email.toLowerCase());
    res.set(NO_CACHE_HEADERS).status(200).json({ status: "success" });
});

// Backup Endpoints
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

app.get('/api/export_workspace', (req, res) => {
    const backup = {
        userData: Array.from(userDataStore.entries()),
        workItems: Array.from(workItemsStore.entries()).map(([k, v]) => [k, Array.from(v.entries())]),
        infoHub: Array.from(infoHubStore.entries()).map(([k, v]) => [k, Array.from(v.entries())]),
        macros: Array.from(macrosStore.entries()).map(([k, v]) => [k, Array.from(v.entries())])
    };
    res.set(NO_CACHE_HEADERS).status(200).json(backup);
});

app.post('/api/import_workspace', (req, res) => {
    try {
        const backup = req.body;
        // Merge logic
        if (backup.userData) backup.userData.forEach(([k, v]: any) => userDataStore.set(k, v));
        if (backup.workItems) backup.workItems.forEach(([k, v]: any) => {
            if (!workItemsStore.has(k)) workItemsStore.set(k, new Map());
            v.forEach(([id, item]: any) => workItemsStore.get(k)!.set(id, item));
        });
        if (backup.infoHub) backup.infoHub.forEach(([k, v]: any) => {
            if (!infoHubStore.has(k)) infoHubStore.set(k, new Map());
            v.forEach(([id, item]: any) => infoHubStore.get(k)!.set(id, item));
        });
        if (backup.macros) backup.macros.forEach(([k, v]: any) => {
            if (!macrosStore.has(k)) macrosStore.set(k, new Map());
            v.forEach(([id, item]: any) => macrosStore.get(k)!.set(id, item));
        });
        res.set(NO_CACHE_HEADERS).status(200).json({ status: "success" });
    } catch(e: any) {
        res.status(500).json({ error: "Internal Server Error", details: e.message });
    }
});

// --- API ENDPOINTS ---

// GET /api/ping
app.get('/api/ping', (req, res) => {
  res.set(NO_CACHE_HEADERS).status(200).send("Kore Enterprise Backend Online.");
});

// POST /api/save_user_data
app.post('/api/save_user_data', (req, res) => {
  try {
    const { userId, dataType, data } = req.body;
    if (!userId || !dataType) {
      return res.status(400).json({ error: "Missing Data." });
    }
    const key = `${userId}::${dataType}`;
    userDataStore.set(key, data);
    res.set(NO_CACHE_HEADERS).status(200).json({ status: "success" });
  } catch (e: any) {
    res.status(500).json({ error: "Internal Server Error", details: e.message });
  }
});


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

// GET /api/get_user_data
app.get('/api/get_user_data', (req, res) => {
  try {
    const userId = req.query.userId as string;
    const dataType = req.query.dataType as string;
    if (!userId || !dataType) {
      return res.set(NO_CACHE_HEADERS).status(400).send("[]");
    }
    const key = `${userId}::${dataType}`;
    const data = userDataStore.get(key);
    if (data === undefined) {
      return res.set(NO_CACHE_HEADERS).status(200).json([]);
    }
    res.set(NO_CACHE_HEADERS).status(200).json(data);
  } catch (e) {
    res.set(NO_CACHE_HEADERS).status(200).json([]);
  }
});

// POST /api/save_work_item
app.post('/api/save_work_item', (req, res) => {
  try {
    const ticket = req.body;
    const ticketId = ticket.id;
    const userId = ticket.authorId;
    if (!userId || !ticketId) {
      return res.status(400).json({ error: "Missing User or Ticket ID." });
    }
    if (!workItemsStore.has(userId)) {
      workItemsStore.set(userId, new Map());
    }
    workItemsStore.get(userId)!.set(ticketId, ticket);
    res.set(NO_CACHE_HEADERS).status(200).json({ status: "success" });
  } catch (e: any) {
    res.status(500).json({ error: "Internal Server Error", details: e.message });
  }
});

// GET /api/get_work_items
app.get('/api/get_work_items', (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      // Return empty list if no userId is supplied instead of failing with 400
      return res.set(NO_CACHE_HEADERS).status(200).json([]);
    }
    const userTickets = workItemsStore.get(userId);
    if (!userTickets) {
      return res.set(NO_CACHE_HEADERS).status(200).json([]);
    }
    res.set(NO_CACHE_HEADERS).status(200).json(Array.from(userTickets.values()));
  } catch (e) {
    res.set(NO_CACHE_HEADERS).status(200).json([]);
  }
});

// POST /api/save_info_page
app.post('/api/save_info_page', (req, res) => {
  try {
    const page = req.body;
    const pageId = page.id;
    const userId = page.authorId;
    const isGlobal = page.isGlobal === true || page.isGlobal === 'true';
    const partitionKey = isGlobal ? "GLOBAL_HUB" : String(userId);
    const counterpartKey = isGlobal ? String(userId) : "GLOBAL_HUB";

    if (!pageId || !userId) {
      return res.status(400).json({ error: "Missing Page ID or Author ID." });
    }

    // GHOST ERADICATION: wipe the counterpart partition to prevent duplicate collisions
    const counterpartPartition = infoHubStore.get(counterpartKey);
    if (counterpartPartition) {
      counterpartPartition.delete(pageId);
    }

    if (!infoHubStore.has(partitionKey)) {
      infoHubStore.set(partitionKey, new Map());
    }
    infoHubStore.get(partitionKey)!.set(pageId, page);
    res.set(NO_CACHE_HEADERS).status(200).json({ status: "success" });
  } catch (e: any) {
    res.status(500).json({ error: "Internal Server Error", details: e.message });
  }
});

// GET /api/get_info_pages
app.get('/api/get_info_pages', (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.set(NO_CACHE_HEADERS).status(400).send("Missing User ID");
    }
    const pagesDict: { [key: string]: any } = {};

    // Get user specific pages
    const userPages = infoHubStore.get(userId);
    if (userPages) {
      for (const [pId, pageData] of userPages.entries()) {
        pagesDict[pId] = pageData;
      }
    }

    // Get global pages (GLOBAL_HUB)
    const globalPages = infoHubStore.get("GLOBAL_HUB");
    if (globalPages) {
      for (const [pId, pageData] of globalPages.entries()) {
        // Global hierarchy overrides personal
        pagesDict[pId] = pageData;
      }
    }

    res.set(NO_CACHE_HEADERS).status(200).json(Object.values(pagesDict));
  } catch (e) {
    res.set(NO_CACHE_HEADERS).status(200).json([]);
  }
});

// POST /api/delete_info_page
app.post('/api/delete_info_page', (req, res) => {
  try {
    const { id: pageId, authorId: userId } = req.body;
    if (!pageId) {
      return res.status(400).json({ error: "Missing page ID" });
    }

    // TACTICAL WIPE: Delete from both partitions
    if (userId) {
      const userPartition = infoHubStore.get(String(userId));
      if (userPartition) {
        userPartition.delete(pageId);
      }
    }
    const globalPartition = infoHubStore.get("GLOBAL_HUB");
    if (globalPartition) {
      globalPartition.delete(pageId);
    }

    res.set(NO_CACHE_HEADERS).status(200).json({ status: "deleted" });
  } catch (e: any) {
    res.status(500).json({ error: "Internal Server Error", details: e.message });
  }
});

// POST /api/save_macro
app.post('/api/save_macro', (req, res) => {
  try {
    const macro = req.body;
    const macroId = macro.id;
    const userId = macro.authorId;
    const isGlobal = macro.isGlobal === true || macro.isGlobal === 'true';
    const partitionKey = isGlobal ? "GLOBAL_MACRO" : String(userId);
    const counterpartKey = isGlobal ? String(userId) : "GLOBAL_MACRO";

    if (!macroId || !userId) {
      return res.status(400).json({ error: "Missing Macro ID or Author ID." });
    }

    // GHOST ERADICATION: wipe counterpart partition
    const counterpartPartition = macrosStore.get(counterpartKey);
    if (counterpartPartition) {
      counterpartPartition.delete(macroId);
    }

    if (!macrosStore.has(partitionKey)) {
      macrosStore.set(partitionKey, new Map());
    }
    macrosStore.get(partitionKey)!.set(macroId, macro);
    res.set(NO_CACHE_HEADERS).status(200).json({ status: "success" });
  } catch (e: any) {
    res.status(500).json({ error: "Internal Server Error", details: e.message });
  }
});

// GET /api/get_macros
app.get('/api/get_macros', (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.set(NO_CACHE_HEADERS).status(400).send("Missing User ID");
    }
    const macrosDict: { [key: string]: any } = {};

    const userMacros = macrosStore.get(userId);
    if (userMacros) {
      for (const [mId, macroData] of userMacros.entries()) {
        macrosDict[mId] = macroData;
      }
    }

    const globalMacros = macrosStore.get("GLOBAL_MACRO");
    if (globalMacros) {
      for (const [mId, macroData] of globalMacros.entries()) {
        macrosDict[mId] = macroData;
      }
    }

    res.set(NO_CACHE_HEADERS).status(200).json(Object.values(macrosDict));
  } catch (e) {
    res.set(NO_CACHE_HEADERS).status(200).json([]);
  }
});

// --- STATIC FILES SERVING ---

// Serve the Kore folder as static assets
app.use(express.static(path.join(process.cwd(), 'Kore')));

// Fallback to serving Kore/index.html for any unrecognized routes
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'Kore', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
