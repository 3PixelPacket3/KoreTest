const fs = require('fs');
const path = require('path');

const file = path.join('.', 'Kore', 'about.html');
let content = fs.readFileSync(file, 'utf8');

const oldFunc = `        async function requestAdminEdit() {
            if (sessionStorage.getItem('kore_admin_unlocked') !== 'true') {
                const pin = prompt("Enter Master Admin PIN to edit System Documentation:");
                const adminData = await loadCloudData('admin_settings') || { pin: 'Admin2026!' };
                const masterPin = adminData.pin || 'Admin2026!';
                
                if (pin !== masterPin) {
                    alert("Access Denied."); return;
                }
                sessionStorage.setItem('kore_admin_unlocked', 'true');
            }`;

const newFunc = `        async function requestAdminEdit() {
            const adminData = await loadCloudData('admin_settings') || { admins: [] };
            if (!adminData.admins) adminData.admins = [];
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const isAdmin = isLocal || adminData.admins.length === 0 || adminData.admins.includes(cloudIdentity.userName);
            
            if (!isAdmin) {
                alert("Authorization Denied. Admin access required.");
                return;
            }`;

if (content.includes(oldFunc)) {
    content = content.replace(oldFunc, newFunc);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Fixed requestAdminEdit in about.html");
} else {
    console.log("Could not find the function in about.html");
}
