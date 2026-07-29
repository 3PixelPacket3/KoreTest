const fs = require('fs');
const path = require('path');

const file = path.join('.', 'Kore', 'about.html');
let content = fs.readFileSync(file, 'utf8');

// 1. Change the button to pass true for atTop
content = content.replace(
    /<button class="btn" onclick="addNoteField\(\)" style="margin-bottom: 24px;">\+ Add Release Note<\/button>/,
    '<button class="btn" onclick="addNoteField(\'\', \'\', true)" style="margin-bottom: 24px;">+ Add Release Note</button>'
);

// 2. Change addNoteField
const oldAddNote = `        function addNoteField(date = '', text = '') {
            const div = document.createElement('div');
            div.style.display = 'flex'; div.style.gap = '12px'; div.style.marginBottom = '12px';
            div.innerHTML = \`
                <input type="text" class="input note-date-input" aria-label="Version / Date" style="width: 250px; margin:0;" placeholder="Version / Date" value="\${escapeHtml(date)}">
                <textarea class="textarea note-text-input" aria-label="Release details..." style="flex-grow: 1; margin:0; min-height:60px; font-family:inherit; background:var(--bg-surface); color:var(--text-main);" placeholder="Release details...">\${escapeHtml(text)}</textarea>
                <button class="btn" style="color: #ef4444; height: 46px;" onclick="this.parentElement.remove()">X</button>
            \`;
            document.getElementById('editNotesContainer').appendChild(div);
        }`;

const newAddNote = `        function addNoteField(date = '', text = '', atTop = false) {
            const div = document.createElement('div');
            div.style.display = 'flex'; div.style.gap = '12px'; div.style.marginBottom = '12px'; div.style.alignItems = 'flex-start';
            div.innerHTML = \`
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <input type="text" class="input note-date-input" aria-label="Version / Date" style="width: 250px; margin:0; font-weight: 600;" placeholder="e.g. v2.1 - Dec 12, 2026" value="\${escapeHtml(date)}">
                </div>
                <textarea class="textarea note-text-input" aria-label="Release details..." style="flex-grow: 1; margin:0; min-height:100px; font-family:var(--font-editor); background:var(--bg-surface); color:var(--text-main);" placeholder="New features, fixes, etc... (Accepts HTML)">\${escapeHtml(text)}</textarea>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <button class="btn" title="Move Up" style="padding: 4px 8px; font-size: 0.8rem;" onclick="if(this.parentElement.parentElement.previousElementSibling) this.parentElement.parentElement.parentNode.insertBefore(this.parentElement.parentElement, this.parentElement.parentElement.previousElementSibling)">↑</button>
                    <button class="btn" title="Move Down" style="padding: 4px 8px; font-size: 0.8rem;" onclick="if(this.parentElement.parentElement.nextElementSibling) this.parentElement.parentElement.parentNode.insertBefore(this.parentElement.parentElement.nextElementSibling, this.parentElement.parentElement)">↓</button>
                    <button class="btn" title="Delete" style="color: #ef4444; padding: 4px 8px; font-size: 0.8rem;" onclick="this.parentElement.parentElement.remove()">X</button>
                </div>
            \`;
            if (atTop) {
                document.getElementById('editNotesContainer').prepend(div);
            } else {
                document.getElementById('editNotesContainer').appendChild(div);
            }
        }`;

content = content.replace(oldAddNote, newAddNote);

// 3. Change renderDisplay
const oldRender = `        function renderDisplay() {
            document.getElementById('aboutContent').innerHTML = aboutData.aboutText; 
            const list = document.getElementById('releaseList');
            list.innerHTML = '';
            
            // Overhauled accordion structure for Release Notes
            aboutData.notes.forEach((note, index) => {
                const isOpen = index === 0 ? 'open' : ''; // Open the most recent one automatically
                list.innerHTML += \`
                    <details class="accordion" \${isOpen}>
                        <summary>\${escapeHtml(note.date)}</summary>
                        <div class="accordion-body">\${escapeHtml(note.text)}</div>
                    </details>
                \`;
            });
        }`;

const newRender = `        function renderDisplay() {
            document.getElementById('aboutContent').innerHTML = aboutData.aboutText; 
            const list = document.getElementById('releaseList');
            list.innerHTML = '';
            
            const recentNotes = aboutData.notes.slice(0, 5);
            const olderNotes = aboutData.notes.slice(5);
            
            recentNotes.forEach((note, index) => {
                const isOpen = index === 0 ? 'open' : ''; // Open the most recent one automatically
                list.innerHTML += \`
                    <details class="accordion" \${isOpen}>
                        <summary>\${escapeHtml(note.date)}</summary>
                        <div class="accordion-body">\${escapeHtml(note.text).replace(/\\n/g, '<br>')}</div>
                    </details>
                \`;
            });
            
            if (olderNotes.length > 0) {
                let olderHtml = olderNotes.map(note => \`
                    <details class="accordion" style="margin-bottom: 8px;">
                        <summary style="background: #f8fafc; font-size: 0.9rem;">\${escapeHtml(note.date)}</summary>
                        <div class="accordion-body" style="font-size: 0.9rem;">\${escapeHtml(note.text).replace(/\\n/g, '<br>')}</div>
                    </details>
                \`).join('');
                
                list.innerHTML += \`
                    <details class="accordion" style="margin-top: 24px; border: 1px dashed var(--border-subtle);">
                        <summary style="font-weight: 600; color: var(--text-secondary);">Archived Backlog (\${olderNotes.length} older releases)</summary>
                        <div class="accordion-body" style="padding: 16px; background: var(--bg-app);">
                            \${olderHtml}
                        </div>
                    </details>
                \`;
            }
        }`;

content = content.replace(oldRender, newRender);

fs.writeFileSync(file, content, 'utf8');
console.log("Fixed release notes in about.html");
