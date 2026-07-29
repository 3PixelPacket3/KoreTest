        window.alert = function(msg) { console.warn("Alert: " + msg); };
        window.confirm = function(msg) { console.warn("Confirm auto-accepted: " + msg); return true; };
    // Theme Initializer to prevent flash on load
    const savedTheme = localStorage.getItem('kore_theme') || 'default';
    if(savedTheme !== 'default') {
        document.body.setAttribute('data-theme', savedTheme);
    }
        // --- Identity and Auth ---
        let cloudIdentity = { userId: "local-dev", userName: "Local Developer" };
        let activeShortcuts = [];

        
        async function fetchSecureIdentity() {
            try {
                const response = await fetch('/.auth/me');
                if (response.ok) {
                    const data = await response.json();
                    if (data.clientPrincipal) {
                        cloudIdentity.userId = data.clientPrincipal.userId || "local-dev";
                        cloudIdentity.userName = data.clientPrincipal.userDetails || "Local User";
                        cloudIdentity.roles = data.clientPrincipal.userRoles || [];
                    }
                }
            } catch (e) { console.warn("Entra ID auth disabled."); }
            
            if (!cloudIdentity.roles || !cloudIdentity.roles.includes('admin')) {
                document.body.innerHTML = `<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; background:var(--bg-app); color:var(--text-main); text-align:center;">
                    <div style="font-size:3rem; margin-bottom:16px;">🛑</div>
                    <h1 style="margin:0 0 16px 0;">Access Denied</h1>
                    <p style="color:var(--text-secondary); max-width:400px; line-height:1.5;">You do not have Entra ID administrator privileges. Please contact your system administrator to request access.</p>
                    <a href="index.html" class="btn btn-primary" style="margin-top:24px; text-decoration:none;">Return to Dashboard</a>
                </div>`;
                return;
            }
            document.getElementById('userIdentityBadge').innerText = `👤 ${cloudIdentity.userName}`;
        }

        // --- Cloud Sync Logic ---
        async function loadCloudData(dataType) {
            try {
                const res = await fetch(`/api/get_user_data?userId=${cloudIdentity.userId}&dataType=${dataType}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && (Object.keys(data).length > 0 || data.length > 0)) return data;
                }
            } catch(e) {}
            return null;
        }

        async function saveCloudData(dataType, data) {
            try {
                await fetch('/api/save_user_data', {
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: cloudIdentity.userId, dataType: dataType, data: data })
                });
            } catch(e) {}
        }

        function flashStatus(elementId) {
            const el = document.getElementById(elementId);
            if(el) {
                el.classList.add('show');
                setTimeout(() => el.classList.remove('show'), 2500);
            }
        }

        // --- Storage Telemetry ---
        // Storage is unlimited in the Cloud Vault.

        // --- Crypto Utils ---
        async function deriveKey(password, salt) {
            const enc = new TextEncoder();
            const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), {name: "PBKDF2"}, false, ["deriveKey"]);
            return crypto.subtle.deriveKey(
                {name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256"},
                keyMaterial, {name: "AES-GCM", length: 256}, false, ["encrypt", "decrypt"]
            );
        }

        // --- JSON Backup Export ---
        document.getElementById('triggerBackupBtn').addEventListener('click', async () => {
            let backupData = {};
            try {
                // Fetch user data from Cloud Vault
                const res = await fetch(`/api/export_user_data?userId=${cloudIdentity.userId}`);
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
            let payloadStr = JSON.stringify(backupData);
            let finalPayload = payloadStr;
            
            if (wantsEncryption) {
                const password = prompt("Enter a strong password to encrypt the backup:");
                if (!password) { alert("Backup cancelled."); return; }
                const enc = new TextEncoder();
                const salt = crypto.getRandomValues(new Uint8Array(16));
                const iv = crypto.getRandomValues(new Uint8Array(12));
                const key = await deriveKey(password, salt);
                const encrypted = await crypto.subtle.encrypt({name: "AES-GCM", iv: iv}, key, enc.encode(payloadStr));
                
                finalPayload = JSON.stringify({
                    _kore_encrypted: true,
                    salt: Array.from(salt),
                    iv: Array.from(iv),
                    data: Array.from(new Uint8Array(encrypted))
                });
            }

            const encoder = new TextEncoder();
            const dataToHash = encoder.encode(finalPayload);
            const hashBuffer = await crypto.subtle.digest('SHA-256', dataToHash);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            const blob = new Blob([finalPayload], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `KORE_BACKUP_${wantsEncryption ? 'ENCRYPTED_' : ''}${new Date().toISOString().split('T')[0]}_[${hashHex.substring(0,8)}].json`;
            a.click();
        });

        // --- JSON Backup Import ---
        document.getElementById('importBackupBtn').addEventListener('click', () => {
            document.getElementById('backupFileInput').click();
        });

        document.getElementById('backupFileInput').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async function(event) {
                try {
                    let parsedFile = JSON.parse(event.target.result);
                    let data = parsedFile;
                    
                    if (parsedFile._kore_encrypted) {
                        const password = prompt("This backup is encrypted. Enter the password:");
                        if (!password) return;
                        
                        try {
                            const salt = new Uint8Array(parsedFile.salt);
                            const iv = new Uint8Array(parsedFile.iv);
                            const encryptedData = new Uint8Array(parsedFile.data);
                            const key = await deriveKey(password, salt);
                            const decrypted = await crypto.subtle.decrypt({name: "AES-GCM", iv: iv}, key, encryptedData);
                            const dec = new TextDecoder();
                            data = JSON.parse(dec.decode(decrypted));
                        } catch(e) {
                            alert("❌ Incorrect password or corrupted backup.");
                            return;
                        }
                    }

                    if (data.userData || data.workItems || data.infoHub || data.macros) {
                        // It's a cloud backup format
                        try {
                            const res = await fetch(`/api/import_user_data?userId=${cloudIdentity.userId}`, {
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
                        alert(`✅ Successfully restored ${count} legacy local records to your Cloud Vault.`);
                        location.reload();
                    }
                } catch (err) {
                    alert('❌ Error: Invalid JSON Backup File.');
                }
            };
            reader.readAsText(file);
        });

        // --- CSV Export & Data Purging ---


        document.getElementById('exportTrackerCsvBtn').addEventListener('click', async () => {
            const items = await loadCloudData('work_items') || JSON.parse(localStorage.getItem('kore_work_items')) || [];
            if(items.length === 0) return alert('No active records found to export.');

            const headers = ['Ticket ID', 'Title', 'Status', 'Due Date', 'Creation Date', 'Account', 'Notes'];
            const csvRows = items.map(i => {
                const escapeStr = (str) => `"${(str || '').replace(/"/g, '""')}"`;
                return [
                    escapeStr(i.id), escapeStr(i.title), escapeStr(i.status),
                    escapeStr(i.dueDate), escapeStr(i.created), escapeStr(i.account), escapeStr(i.notes)
                ].join(',');
            });
            
            const csvString = [headers.join(','), ...csvRows].join('\n');
            
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `Kore_Tracker_Historical_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            
            setTimeout(() => {
                alert('Export generated successfully.');
            }, 500); 
        });

        // --- COMMAND PALETTE LOGIC ---
        const fnModal = document.getElementById('floatingNotepad');
        const fnContent = document.getElementById('fnContent');
        const fnPushBtn = document.getElementById('fnPushBtn');
        let isDragging = false, currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;

        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key.toLowerCase() === 'n') {
                e.preventDefault();
                fnModal.style.display = fnModal.style.display === 'flex' ? 'none' : 'flex';
                if (fnModal.style.display === 'flex') {
                    fnContent.value = localStorage.getItem('kore_global_notepad') || '';
                    fnContent.focus();
                    checkNotepadFormatting();
                }
            }
        });

        document.getElementById('fnClose').addEventListener('click', () => { fnModal.style.display = 'none'; });

        document.getElementById('fnHeader').addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        function dragStart(e) { initialX = e.clientX - xOffset; initialY = e.clientY - yOffset; isDragging = true; }
        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX; currentY = e.clientY - initialY;
                xOffset = currentX; yOffset = currentY;
                fnModal.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
        }
        function dragEnd(e) { initialX = currentX; initialY = currentY; isDragging = false; }

        let fnTimeout;
        fnContent.addEventListener('input', () => {
            localStorage.setItem('kore_global_notepad', fnContent.value);
            document.getElementById('fnStatus').innerText = 'Saving...';
            clearTimeout(fnTimeout);
            fnTimeout = setTimeout(() => { document.getElementById('fnStatus').innerText = 'Saved locally.'; checkNotepadFormatting(); }, 800);
        });

        function checkNotepadFormatting() {
            const val = fnContent.value;
            if (val.startsWith('```')) { fnContent.classList.add('code-mode'); } else { fnContent.classList.remove('code-mode'); }
            const hasTodo = /-\s?\[\s?\]\s?.+/i.test(val);
            fnPushBtn.style.display = hasTodo ? 'block' : 'none';
        }

        fnPushBtn.addEventListener('click', async () => {
            const lines = fnContent.value.split('\n');
            let newTasks = []; let remainingLines = [];
            lines.forEach((line, index) => {
                const match = line.match(/-\s?\[\s?\]\s?(.+)/i);
                if (match) { 
                    newTasks.push({ id: 'todo_' + Date.now() + '_' + index, title: match[1].trim(), priority: "Medium", completed: false, dueDate: new Date().toISOString().split('T')[0] }); 
                } else { remainingLines.push(line); }
            });
            if (newTasks.length > 0) {
                let existingTodos = await loadCloudData('todos') || [];
                existingTodos = existingTodos.concat(newTasks);
                try {
                    await fetch('/api/save_user_data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: cloudIdentity.userId, dataType: 'todos', data: existingTodos }) });
                } catch(e) {}
                fnContent.value = remainingLines.join('\n');
                localStorage.setItem('kore_global_notepad', fnContent.value);
                document.getElementById('fnStatus').innerText = `Pushed ${newTasks.length} tasks!`;
                fnPushBtn.style.display = 'none';
            }
        });

        // --- Initialization ---
        async function initSettings() {
            // 1. Load Identity / Profile (Cloud First)
            const profile = await loadCloudData('profile');
            if (profile) {
                document.getElementById('profileNameInput').value = profile.name || '';
                document.getElementById('weatherLocationInput').value = profile.location || '';
                document.getElementById('timeZoneSelect').value = profile.tz || 'America/New_York';
                document.getElementById('themeSelect').value = profile.theme || localStorage.getItem('kore_theme') || 'default';
                

            } else {
                document.getElementById('themeSelect').value = localStorage.getItem('kore_theme') || 'default';
            }

                // Load Nav Preferences
                const allNavs = [
                    { href: 'apps.html', label: 'Apps' },
                    { href: 'file-converter.html', label: 'File to LOAD Converter' },
                    { href: 'lod.html', label: 'LOD Validation Tool' },
                    { href: 'macros.html', label: 'Macro Library' },
                    { href: 'nebula.html', label: 'Nebula HTML Forge' },
                    { href: 'passwords.html', label: 'Password Generator' },
                    { href: 'business-tools.html', label: 'Business & Sec Tools' },
                    { href: 'todo.html', label: 'Personal To-Do' },
                    { href: 'product-html.html', label: 'Product HTML Converter' },
                    { href: 'scanner.html', label: 'Vulnerability Scanner' },
                    { href: 'work.html', label: 'Work Tracker' },
                    { href: 'info-archive.html', label: 'Archive' },
                    { href: 'reports.html', label: 'Data/Reports' },
                    { href: 'docs.html', label: 'Document Library' },
                    { href: 'info-hub.html', label: 'Info Hub' }
                ];
                const hiddenNavs = JSON.parse(localStorage.getItem('kore_hidden_navs') || '[]');
                const navGrid = document.getElementById('navPrefGrid');
                if (navGrid) {
                    navGrid.innerHTML = allNavs.map(nav => `
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: var(--text-main);">
                            <input type="checkbox" class="nav-pref-checkbox" value="${nav.href}" ${!hiddenNavs.includes(nav.href) ? 'checked' : ''}>
                            ${nav.label}
                        </label>
                    `).join('');
                }

            // Live Theme Preview
            document.getElementById('saveNavPrefBtn')?.addEventListener('click', () => {
                const checkboxes = document.querySelectorAll('.nav-pref-checkbox');
                const newHidden = [];
                checkboxes.forEach(cb => {
                    if (!cb.checked) newHidden.push(cb.value);
                });
                localStorage.setItem('kore_hidden_navs', JSON.stringify(newHidden));
                flashStatus('navPrefStatus');
                applyNavPreferences(); // Apply immediately
            });
            
            document.getElementById('themeSelect').addEventListener('change', (e) => {
                const selected = e.target.value;
                if(selected === 'default') {
                    document.body.removeAttribute('data-theme');
                } else {
                    document.body.setAttribute('data-theme', selected);
                }
                localStorage.setItem('kore_theme', selected);
            });

            document.getElementById('saveIdentityBtn').addEventListener('click', async () => {
                const selectedTheme = document.getElementById('themeSelect').value;
                localStorage.setItem('kore_theme', selectedTheme); // Save locally for instant load
                
                const p = { 
                    name: document.getElementById('profileNameInput').value,
                    location: document.getElementById('weatherLocationInput').value,
                    tz: document.getElementById('timeZoneSelect').value,
                    theme: selectedTheme
                };
                await saveCloudData('profile', p);
                flashStatus('identityStatus');
            });

            // 2. Load Shortcuts (Cloud Only)
            activeShortcuts = await loadCloudData('shortcuts') || [
                {title: "Apps", url: "apps.html", icon: "🚀"}, 
                {title: "Work Tracker", url: "work.html", icon: "📋"}, 
                {title: "Macro Library", url: "macros.html", icon: "💻"}
            ];
            
            function renderShortcuts() {
                const scContainer = document.getElementById('shortcutsListContainer');
                scContainer.innerHTML = activeShortcuts.map((sc, idx) => `
                    <div class="list-item">
                        <div>
                            <div class="list-item-title">${sc.title}</div>
                            <div class="list-item-sub">${sc.url}</div>
                        </div>
                        <button class="remove-btn" onclick="removeShortcut(${idx})">Remove</button>
                    </div>
                `).join('');
            }
            renderShortcuts();

            window.removeShortcut = async function(idx) {
                activeShortcuts.splice(idx, 1);
                renderShortcuts();
                await saveCloudData('shortcuts', activeShortcuts);
            }

            document.getElementById('addShortcutBtn').addEventListener('click', async () => {
                const t = document.getElementById('newScTitle').value.trim();
                const u = document.getElementById('newScUrl').value.trim();
                if(t && u) {
                    activeShortcuts.push({title: t, url: u, icon: "🔗"});
                    renderShortcuts();
                    document.getElementById('newScTitle').value = '';
                    document.getElementById('newScUrl').value = '';
                    await saveCloudData('shortcuts', activeShortcuts);
                    flashStatus('shortcutsStatus');
                }
            });

            // 3. Load Info Hub Categories (Cloud / Local Fallback)
            let cats = await loadCloudData('info_categories');
            if (!cats) {
                const localCats = localStorage.getItem('kore_info_categories');
                cats = localCats ? JSON.parse(localCats) : ["Macros", "Vendor Specs", "LOD Rules", "Azure Docs"];
            }
            document.getElementById('hubCategoriesInput').value = cats.join('\n');

            document.getElementById('saveCategoriesBtn').addEventListener('click', async () => {
                const newCats = document.getElementById('hubCategoriesInput').value.split('\n').map(c => c.trim()).filter(Boolean);
                localStorage.setItem('kore_info_categories', JSON.stringify(newCats));
                await saveCloudData('info_categories', newCats);
                flashStatus('categoriesStatus');
            });

            // 4. Load Work Logic (Cloud Only)
            const workConfig = await loadCloudData('work_config') || { 
                types: ["Feature Update", "Bug Fix"], 
                allocations: ["Internal Overhead", "Client A"] 
            };
            
            document.getElementById('workTypesInput').value = (workConfig.types || []).join('\n');
            document.getElementById('accountAllocationsInput').value = (workConfig.allocations || []).join('\n');
            
            document.getElementById('saveWorkLogicBtn').addEventListener('click', async () => {
                const conf = { 
                    types: document.getElementById('workTypesInput').value.split('\n').map(s=>s.trim()).filter(Boolean),
                    allocations: document.getElementById('accountAllocationsInput').value.split('\n').map(s=>s.trim()).filter(Boolean)
                };
                await saveCloudData('work_config', conf);
                flashStatus('workLogicStatus');
            });

            // 5. Admin Persistence Logic (Cloud/Session)
            let adminData = await loadCloudData('admin_settings') || { bulletin: "", admins: [] };
            if (!adminData.admins) adminData.admins = [];
            document.getElementById('sysBulletinInput').value = adminData.bulletin || "";
            
            // Check Admin Access
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const isAdmin = isLocal || adminData.admins.length === 0 || adminData.admins.includes(cloudIdentity.userName);
            
            if (isAdmin) {
                document.getElementById('adminSectionContainer').style.display = 'block';
            } else {
                document.getElementById('adminSectionContainer').style.display = 'none';
            }
            
            function renderAdmins() {
                const list = document.getElementById('adminList');
                if(!list) return;
                list.innerHTML = '';
                adminData.admins.forEach((email, i) => {
                    const row = document.createElement('div');
                    row.style.display = 'flex';
                    row.style.justifyContent = 'space-between';
                    row.style.alignItems = 'center';
                    row.style.background = 'var(--bg-secondary)';
                    row.style.padding = '8px 12px';
                    row.style.borderRadius = '4px';
                    row.innerHTML = `<span style="color: var(--text-main); font-size: 0.9rem;">${email}</span> <button class="btn btn-danger" style="padding: 4px 8px; font-size: 0.8rem;" data-index="${i}">Remove</button>`;
                    list.appendChild(row);
                });
                
                list.querySelectorAll('.btn-danger').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const idx = e.target.getAttribute('data-index');
                        adminData.admins.splice(idx, 1);
                        await saveCloudData('admin_settings', adminData);
                        renderAdmins();
                        flashStatus('adminStatus');
                    });
                });
            }
            renderAdmins();

            document.getElementById('addAdminBtn').addEventListener('click', async () => {
                const emailInput = document.getElementById('newAdminEmail');
                const email = emailInput.value.trim();
                if (email && email.includes('@')) {
                    if (!adminData.admins.includes(email)) {
                        adminData.admins.push(email);
                        await saveCloudData('admin_settings', adminData);
                        renderAdmins();
                        emailInput.value = '';
                        flashStatus('adminStatus');
                    } else {
                        alert('Admin already exists.');
                    }
                } else {
                    alert('Please enter a valid email address.');
                }
            });

            document.getElementById('saveAdminBtn').addEventListener('click', async () => {
                adminData.bulletin = document.getElementById('sysBulletinInput').value.trim();
                await saveCloudData('admin_settings', adminData);
                flashStatus('adminStatus');
            });
        }

        document.addEventListener('DOMContentLoaded', async () => {
            
            await fetchSecureIdentity();
            initSettings();
        });
        window.alert = function(msg) { console.warn("Alert: " + msg); };
        window.confirm = function(msg) { console.warn("Confirm auto-accepted: " + msg); return true; };
        window.addEventListener('scroll', () => {
            const btn = document.getElementById('backToTop');
            if(window.scrollY > 300) btn.style.display = 'flex';
            else btn.style.display = 'none';
        });
        
        function toggleMobileNav() {
            const nav = document.querySelector('.nav-menu');
            if(nav) nav.classList.toggle('open');
        }
        
        if('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(console.error);
        }
        window.alert = function(msg) { console.warn("Alert: " + msg); };
        window.confirm = function(msg) { console.warn("Confirm auto-accepted: " + msg); return true; };
        // --- Navigation Preferences Logic ---
        function applyNavPreferences() {
            try {
                const hiddenNavs = JSON.parse(localStorage.getItem('kore_hidden_navs') || '[]');
                if (hiddenNavs.length > 0) {
                    const links = document.querySelectorAll('.dropdown-content a');
                    links.forEach(link => {
                        const href = link.getAttribute('href');
                        if (hiddenNavs.includes(href)) {
                            link.style.display = 'none';
                        } else {
                            link.style.display = 'block';
                        }
                    });
                    
                    // Hide empty dropdowns
                    document.querySelectorAll('.nav-item').forEach(item => {
                        const dropdown = item.querySelector('.dropdown-content');
                        if (dropdown) {
                            const visibleLinks = Array.from(dropdown.querySelectorAll('a')).filter(a => a.style.display !== 'none');
                            if (visibleLinks.length === 0) {
                                item.style.display = 'none';
                            } else {
                                item.style.display = 'flex';
                            }
                        }
                    });
                } else {
                    document.querySelectorAll('.dropdown-content a').forEach(a => a.style.display = 'block');
                }
            } catch(e) {}
        }
        document.addEventListener('DOMContentLoaded', applyNavPreferences);
