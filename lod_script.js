
        // --- Microsoft Entra ID Integration ---
        let cloudIdentity = { userId: "local-dev", userName: "Local Developer" };

        async function fetchSecureIdentity() {
            try {
                const response = await fetch('/.auth/me');
                const data = await response.json();
                if (data.clientPrincipal) {
                    cloudIdentity.userId = data.clientPrincipal.userId;
                    cloudIdentity.userName = data.clientPrincipal.userDetails;
                    document.getElementById('userIdentityBadge').innerText = `👤 ${cloudIdentity.userName}`;
                } else {
                    document.getElementById('userIdentityBadge').innerText = "Running Locally (Unauthenticated)";
                }
            } catch (error) {
                console.log("Auth fetch bypassed - Local execution.");
                document.getElementById('userIdentityBadge').innerText = "System Admin Offline Mode";
            }
        }

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

        document.addEventListener('DOMContentLoaded', async () => {
            await fetchSecureIdentity();
        });

        // --- Drag and Drop UI Logic ---
        var dropZone = document.getElementById('dropZone');
        var fileInput = document.getElementById('lodFileInput');
        var selectedFileName = document.getElementById('selectedFileName');
        var currentFile = null;

        dropZone.addEventListener('click', () => fileInput.click());

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFileSelect(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
            }
        });

        function handleFileSelect(file) {
            if (!file.name.toLowerCase().endsWith('.csv')) {
                setStatus('Error: Please upload a valid .CSV file.', true);
                return;
            }
            currentFile = file;
            selectedFileName.textContent = `Attached: ${file.name}`;
            selectedFileName.style.display = 'block';
            setStatus('File loaded and ready for execution.', false, true);
        }

        // --- Validation Logic Initialization ---
        var validateBtn = document.getElementById('lodValidateBtn');
        var healBtn = document.getElementById('lodHealBtn');
        var modeSelect = document.getElementById('lodMode');
        
        // Toggles
        var stopOnFatalCheckbox = document.getElementById('lodStopOnFatal');
        var ignoreServiceLevelCheckbox = document.getElementById('ignoreServiceLevel');
        var ignoreEmailValidationCheckbox = document.getElementById('ignoreEmailValidation');
        var ignorePoUniquenessCheckbox = document.getElementById('ignorePoUniqueness');
        var ignoreZipValidationCheckbox = document.getElementById('ignoreZipValidation');
        var ignoreCountryValidationCheckbox = document.getElementById('ignoreCountryValidation');

        var statusEl = document.getElementById('lodStatus');

        var totalRowsEl = document.getElementById('lodTotalRows');
        var errorRowCountEl = document.getElementById('lodErrorRowCount');
        var totalIssuesEl = document.getElementById('lodTotalIssues');

        var noErrorsMessageEl = document.getElementById('lodNoErrorsMessage');
        var errorsContainerEl = document.getElementById('lodErrorsContainer');
        var errorsTableBodyEl = document.getElementById('lodErrorsTableBody');

        var heatmapContainerEl = document.getElementById('lodHeatmapContainer');
        var heatmapHeadEl = document.getElementById('heatmapHead');
        var heatmapBodyEl = document.getElementById('heatmapBody');

        var downloadErrorCsvBtn = document.getElementById('lodDownloadErrorCsvBtn');
        var downloadHtmlReportBtn = document.getElementById('lodDownloadHtmlReportBtn');
        var copyResultsBtn = document.getElementById('lodCopyResultsBtn');

        var lastValidation = null;

        validateBtn.addEventListener('click', function () {
            processFile(false);
        });

        healBtn.addEventListener('click', function() {
            processFile(true);
        });

        function processFile(doHeal) {
            if (!currentFile) {
                setStatus('Error: Please select or drop a CSV file first.', true);
                return;
            }

            var reader = new FileReader();
            setStatus('Parsing file data...', false);

            reader.onload = function (e) {
                try {
                    var text = e.target.result || '';
                    
                    if (doHeal) {
                        text = healCsvData(text);
                        setStatus('Auto-Heal applied. Re-validating...', false);
                    }

                    var mode = (modeSelect && modeSelect.value) || 'lod';
                    var config = {
                        stopOnFatal: !!(stopOnFatalCheckbox && stopOnFatalCheckbox.checked),
                        ignoreServiceLevel: !!(ignoreServiceLevelCheckbox && ignoreServiceLevelCheckbox.checked),
                        ignoreEmailValidation: !!(ignoreEmailValidationCheckbox && ignoreEmailValidationCheckbox.checked),
                        ignorePoUniqueness: !!(ignorePoUniquenessCheckbox && ignorePoUniquenessCheckbox.checked),
                        ignoreZipValidation: !!(ignoreZipValidationCheckbox && ignoreZipValidationCheckbox.checked),
                        ignoreCountryValidation: !!(ignoreCountryValidationCheckbox && ignoreCountryValidationCheckbox.checked),
                        ignoreOrderType: !!(document.getElementById('ignoreOrderType') && document.getElementById('ignoreOrderType').checked),
                        ignoreWhitespace: !!(document.getElementById('ignoreWhitespace') && document.getElementById('ignoreWhitespace').checked)
                    };

                    var result = validateLodCsv(text, mode, config);
                    lastValidation = result;
                    renderValidation(result);
                    
                    if (doHeal) {
                        downloadTextFile(text, buildSuggestedFilename(result, 'HEALED.csv'), 'text/csv');
                        setStatus('Engine executed with Auto-Heal. Clean file downloading.', false, true);
                    } else {
                        setStatus('Engine execution complete.', false, true);
                    }
                } catch (err) {
                    console.error(err);
                    lastValidation = null;
                    renderEmpty();
                    setStatus('Fatal Error: ' + (err && err.message ? err.message : String(err)), true);
                }
            };

            reader.onerror = function () {
                setStatus('IO Error: Unable to read file payload.', true);
            };

            reader.readAsText(currentFile);
        }

        if (downloadErrorCsvBtn) {
            downloadErrorCsvBtn.addEventListener('click', function () {
                if (!lastValidation || !lastValidation.issues || !lastValidation.issues.length) return;
                var csv = buildIssueCsv(lastValidation);
                downloadTextFile(csv, buildSuggestedFilename(lastValidation, 'Issues.csv'), 'text/csv');
            });
        }

        if (downloadHtmlReportBtn) {
            downloadHtmlReportBtn.addEventListener('click', function () {
                if (!lastValidation || !lastValidation.rows || !lastValidation.rows.length) return;
                var html = buildHtmlReport(lastValidation);
                downloadTextFile(html, buildSuggestedFilename(lastValidation, 'Report.html'), 'text/html');
            });
        }

        if (copyResultsBtn) {
            copyResultsBtn.addEventListener('click', function () {
                if (!lastValidation) return;
                var text = buildClipboardSummary(lastValidation);
                if (!text) return;

                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text)
                        .then(function () { setStatus('Results copied to clipboard.', false, true); })
                        .catch(function (err) { console.error(err); fallbackCopyText(text); });
                } else {
                    fallbackCopyText(text);
                }
            });
        }

        function setStatus(message, isError, isSuccess = false) {
            if (!statusEl) return;
            statusEl.textContent = message || '';
            statusEl.className = 'status-text active';
            if (isError) statusEl.classList.add('error');
            if (isSuccess) statusEl.classList.add('success');
            
            if (!isError) {
                setTimeout(() => { statusEl.classList.remove('active', 'success'); }, 4000);
            }
        }

        function renderEmpty() {
            totalRowsEl.textContent = '0';
            errorRowCountEl.textContent = '0';
            totalIssuesEl.textContent = '0';
            noErrorsMessageEl.style.display = 'none';
            errorsContainerEl.style.display = 'none';
            heatmapContainerEl.style.display = 'none';
            errorsTableBodyEl.innerHTML = '';
        }

        function renderValidation(result) {
            if (!result) { renderEmpty(); return; }

            totalRowsEl.textContent = String(result.dataRowCount || 0);
            errorRowCountEl.textContent = String(result.errorRowCount || 0);
            totalIssuesEl.textContent = String(result.issues.length || 0);

            if (!result.issues.length) {
                noErrorsMessageEl.style.display = 'block';
                errorsContainerEl.style.display = 'none';
                errorsTableBodyEl.innerHTML = '';
                return;
            }

            noErrorsMessageEl.style.display = 'none';
            errorsContainerEl.style.display = 'block';

            var rowsHtml = [];
            for (var i = 0; i < result.issues.length; i++) {
                var issue = result.issues[i];
                rowsHtml.push(
                    '<tr>' +
                        '<td><strong style="color:var(--text-main);">' + escapeHtml(String(issue.row)) + '</strong></td>' +
                        '<td><span style="font-weight:600;">' + escapeHtml(issue.columnName || '') + '</span></td>' +
                        '<td><code style="background:rgba(14, 165, 233, 0.1); padding:2px 6px; border-radius:4px; border:1px solid var(--border-subtle); font-family:monospace; white-space:pre; color:var(--text-main);">' + escapeHtml(issue.value == null ? '' : String(issue.value)) + '</code></td>' +
                        '<td><span class="error-pill">' + escapeHtml(issue.message || '') + '</span></td>' +
                    '</tr>'
                );
            }
            errorsTableBodyEl.innerHTML = rowsHtml.join('');

            renderHeatmap(result);
        }

        function renderHeatmap(result) {
            heatmapContainerEl.style.display = 'block';
            
            // Build Bad Cell Map for quick lookup
            var badCellMap = {};
            var errorRowsList = [];
            var errorRowTracker = {};

            for (var i = 0; i < result.issues.length; i++) {
                var rowIdx = result.issues[i].row;
                badCellMap[rowIdx + ':' + result.issues[i].columnIndex] = true;
                if (!errorRowTracker[rowIdx]) {
                    errorRowTracker[rowIdx] = true;
                    errorRowsList.push(rowIdx);
                }
            }

            // Limit to first 5 rows with errors for the preview
            var previewRows = errorRowsList.sort((a, b) => a - b).slice(0, 5);

            // Render Header
            var headHtml = '<tr><th>Row #</th>';
            for (var h = 0; h < result.header.length; h++) {
                headHtml += '<th>' + escapeHtml(result.header[h] || 'Col ' + (h+1)) + '</th>';
            }
            headHtml += '</tr>';
            heatmapHeadEl.innerHTML = headHtml;

            // Render Body
            var bodyHtml = '';
            for (var i = 0; i < previewRows.length; i++) {
                var actualRowIndex = previewRows[i];
                var dataRow = result.dataRows[actualRowIndex - 2]; // offset for header and 0-index
                
                bodyHtml += '<tr><td><strong>' + actualRowIndex + '</strong></td>';
                for (var c = 0; c < result.header.length; c++) {
                    var isBad = badCellMap[actualRowIndex + ':' + c];
                    var cellClass = isBad ? ' class="heatmap-bad-cell"' : '';
                    var cellVal = dataRow[c] == null ? '' : String(dataRow[c]);
                    bodyHtml += '<td' + cellClass + '>' + escapeHtml(cellVal) + '</td>';
                }
                bodyHtml += '</tr>';
            }
            heatmapBodyEl.innerHTML = bodyHtml;
        }

        // --- Core File Parsers & Fixers ---
        function parseCsv(text) {
            var rows = []; var row = []; var cur = ''; var inQuotes = false;
            for (var i = 0; i < text.length; i++) {
                var ch = text[i];
                if (inQuotes) {
                    if (ch === '"') {
                        if (text[i + 1] === '"') { cur += '"'; i++; } 
                        else { inQuotes = false; }
                    } else { cur += ch; }
                } else {
                    if (ch === '"') { inQuotes = true; } 
                    else if (ch === ',') { row.push(cur); cur = ''; } 
                    else if (ch === '\r') {} 
                    else if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; } 
                    else { cur += ch; }
                }
            }
            if (cur.length || row.length) { row.push(cur); rows.push(row); }

            var cleaned = [];
            for (var r = 0; r < rows.length; r++) {
                var cells = rows[r]; var allEmpty = true;
                for (var c = 0; c < cells.length; c++) {
                    if (String(cells[c]).trim() !== '') { allEmpty = false; break; }
                }
                if (!allEmpty) { cleaned.push(cells); }
            }
            return cleaned;
        }

        function healCsvData(text) {
            var rows = parseCsv(text || '');
            if (!rows.length) return text;
            var header = rows[0];
            var dataRows = rows.slice(1);
            
            for(var i=0; i<dataRows.length; i++) {
                // Global trim & backtick removal for all columns
                for (var j=0; j<dataRows[i].length; j++) {
                    if (dataRows[i][j] != null) {
                        dataRows[i][j] = String(dataRows[i][j]).replace(/`/g, '').trim();
                    }
                }
                
                // 0: Group Code uppercase
                if(dataRows[i][0]) dataRows[i][0] = String(dataRows[i][0]).toUpperCase();
                
                // 10: State uppercase
                if(dataRows[i][10]) dataRows[i][10] = String(dataRows[i][10]).toUpperCase();
                
                // 12: Country uppercase
                if(dataRows[i][12]) dataRows[i][12] = String(dataRows[i][12]).toUpperCase();
                
                // 14: Contact Phone (strip non-numeric)
                if(dataRows[i][14]) dataRows[i][14] = String(dataRows[i][14]).replace(/\D/g, '');

                // 15: Order Type uppercase
                if(dataRows[i][15]) dataRows[i][15] = String(dataRows[i][15]).toUpperCase();
                
                // 16: Service Level uppercase
                if(dataRows[i][16]) dataRows[i][16] = String(dataRows[i][16]).toUpperCase();
                
                // 17: Allocation Rule (must be O)
                if(!dataRows[i][17] || String(dataRows[i][17]).toUpperCase() !== 'O') {
                    dataRows[i][17] = 'O';
                }
                
                // 19: Indicator uppercase
                if(dataRows[i][19]) dataRows[i][19] = String(dataRows[i][19]).toUpperCase();
                
                // 21: Address Over-Ride uppercase
                if(dataRows[i][21]) dataRows[i][21] = String(dataRows[i][21]).toUpperCase();

                // 25: Confirmation Email (replace ,com with .com, remove spaces)
                if(dataRows[i][25]) dataRows[i][25] = String(dataRows[i][25]).replace(/,com/g, '.com').replace(/\s+/g, '');
                
                // 26: Ship Confirmation Email
                if(dataRows[i][26]) dataRows[i][26] = String(dataRows[i][26]).replace(/,com/g, '.com').replace(/\s+/g, '');
            }
            
            var lines = [header.map(csvQuote).join(',')];
            for(var i=0; i<dataRows.length; i++) {
                lines.push(dataRows[i].map(csvQuote).join(','));
            }
            return lines.join('\r\n');
        }

        function validateLodCsv(text, mode, config) {
            var rows = parseCsv(text || '');
            if (!rows.length) throw new Error('The file appears to be empty.');

            var header = rows[0];
            var dataRows = rows.slice(1);
            var EXPECTED_COLUMNS = 28;

            if (header.length !== EXPECTED_COLUMNS) {
                if (config.stopOnFatal) throw new Error('Unexpected column layout. Expected ' + EXPECTED_COLUMNS + ' columns but found ' + header.length + '.');
            }

            var DISPLAY_COLUMN_NAMES = [
                'Group Code', 'Customer #', 'Item Number', 'Quantity', 'Customer PO', 'Name', 'Ship-to-Address 1', 'Ship-to Address 2', 'Ship-to Address 3', 'City', 'State', 'ZIP', 'Country', 'Contact name', 'Contact', 'Order Type', 'Service Level of Shipment', 'Allocation Rule', 'Customer In Hands Date', 'On or Before Indicator (O or B)', 'Must Ship Date', 'Address Over-Ride', 'Carrier', 'Ship From Warehouse', 'GL-Code', 'Confirmation Email', 'Ship Confirmation Email', 'Site'
            ];

            function getColName(index) {
                if (header[index] && String(header[index]).trim()) return String(header[index]).trim();
                return DISPLAY_COLUMN_NAMES[index] || ('Column ' + (index + 1));
            }

            var issues = [];
            var errorRowSet = {};

            function addIssue(rowIndex, colIndex, message, value) {
                issues.push({ 
                    row: rowIndex, 
                    columnIndex: colIndex, 
                    columnName: getColName(colIndex), 
                    message: message, 
                    value: value 
                });
                errorRowSet[rowIndex] = true;
            }

            var poAddressMap = {};
            var poItemMap = {};

            for (var i = 0; i < dataRows.length; i++) {
                var row = dataRows[i] || [];
                var rowIndex = i + 2; 

                var nonEmpty = false;
                for (var c = 0; c < row.length; c++) {
                    if (String(row[c] || '').trim() !== '') { nonEmpty = true; break; }
                }
                if (!nonEmpty) continue;
                
                // Pre-Validation Loop: Global check for trailing spaces and backticks
                if (!config.ignoreWhitespace) {
                    for (var c = 0; c < row.length; c++) {
                        var rawVal = row[c] == null ? '' : String(row[c]);
                        if (rawVal !== rawVal.trim()) {
                            addIssue(rowIndex, c, 'Contains leading or trailing spaces.', rawVal);
                        }
                        if (rawVal.indexOf('`') !== -1) {
                            addIssue(rowIndex, c, 'Contains invalid backtick (`) character.', rawVal);
                        }
                    }
                }

                // Core value retrieval helper (auto-trims for the logic checks below)
                function val(idx) { return (row[idx] == null ? '' : String(row[idx])).trim(); }

                // 0: Group Code
                (function () {
                    var v = val(0);
                    if (!v) addIssue(rowIndex, 0, 'Group Code is required.', v);
                    else if (v !== v.toUpperCase()) addIssue(rowIndex, 0, 'Group Code must be uppercase.', v);
                })();
                
                // 1: Customer Number
                (function () {
                    var v = val(1);
                    if (!v) { addIssue(rowIndex, 1, 'Customer # is required.', v); return; }
                    if (!/^\d+$/.test(v)) addIssue(rowIndex, 1, 'Customer # must be numeric.', v);
                    if (v.slice(-2) === '00') addIssue(rowIndex, 1, 'Customer # cannot end in "00".', v);
                })();
                
                // 2: Item Number & 3: Quantity
                (function () { 
                    var v2 = val(2); if (!v2) addIssue(rowIndex, 2, 'Item Number is required.', v2); 
                    var v3 = val(3);
                    if (!v3) { addIssue(rowIndex, 3, 'Quantity is required.', v3); }
                    else if (!/^\d+$/.test(v3)) addIssue(rowIndex, 3, 'Quantity must be a whole number.', v3);
                    else if (parseInt(v3, 10) <= 0) addIssue(rowIndex, 3, 'Quantity must be greater than zero.', v3);
                })();
                
                // 4: Customer PO & Duplicate Line Logic
                (function () {
                    var v = val(4);
                    if (!v) { addIssue(rowIndex, 4, 'Customer PO is required.', v); return; }
                    if (v.length > 20) addIssue(rowIndex, 4, 'Customer PO max 20 chars.', v);

                    var orderType = val(15);
                    if (mode === 'palod') {
                        if (v.indexOf('1NAPR-') !== 0) addIssue(rowIndex, 4, 'PALOD requires PO to start with 1NAPR-.', v);
                    } else {
                        if (orderType === 'PA' && v.indexOf('1NAPR-') !== 0) addIssue(rowIndex, 4, 'PA orders must have PO starting with 1NAPR-.', v);
                    }

                    // Duplicate Item per PO Check
                    var currentItem = val(2);
                    if (currentItem) {
                        if (!poItemMap[v]) poItemMap[v] = {};
                        if (poItemMap[v][currentItem]) {
                            addIssue(rowIndex, 2, 'Duplicate Item Number detected for the same Customer PO.', currentItem);
                        } else {
                            poItemMap[v][currentItem] = true;
                        }
                    }

                    // Address Uniqueness per PO
                    if (!config.ignorePoUniqueness && v) {
                        var addrKey = [val(1), val(5), val(6), val(7), val(8), val(9), val(10), val(11), val(12)].join('|').toUpperCase();
                        if (poAddressMap[v] && poAddressMap[v] !== addrKey) {
                            addIssue(rowIndex, 4, 'Customer PO reused for a different address (Not consolidated).', v);
                        } else if (!poAddressMap[v]) {
                            poAddressMap[v] = addrKey;
                        }
                    }
                })();
                
                // 5, 6, 7: Name and Address
                (function () { 
                    if (!val(5)) addIssue(rowIndex, 5, 'Customer name is required.', val(5)); 
                    if (val(6) && val(6).length > 35) addIssue(rowIndex, 6, 'Address 1 max 35 characters.', val(6)); 
                    var v7 = val(7);
                    if (!v7) { addIssue(rowIndex, 7, 'Ship-to Address 2 is required.', v7); }
                    else if (/PO\s*BOX/i.test(v7) && /,/.test(v7) && /\d/.test(v7.split(',')[1] || '')) {
                        addIssue(rowIndex, 7, 'Contains multiple addresses.', v7);
                    }
                })();
                
                // 9, 10, 11, 12: City, State, ZIP, Country
                (function () { 
                    if (!val(9)) addIssue(rowIndex, 9, 'City is required.', val(9)); 
                    var state = val(10);
                    if (!state) { addIssue(rowIndex, 10, 'State is required.', state); }
                    else if (!/^[A-Z]{2}$/.test(state)) addIssue(rowIndex, 10, 'State must be 2 uppercase letters.', state);
                    
                    var zip = val(11);
                    if (!zip) { addIssue(rowIndex, 11, 'ZIP is required.', zip); }
                    else if (!config.ignoreZipValidation) {
                        var cleaned = String(zip).replace(/-/g, '').trim();
                        if (!/^\d+$/.test(cleaned)) { addIssue(rowIndex, 11, 'ZIP must be numeric.', zip); }
                        else if (![4, 5, 8, 9].includes(cleaned.length)) { addIssue(rowIndex, 11, 'ZIP must be 4, 5, 8, or 9 digits.', zip); }
                    }

                    var ctry = val(12);
                    if (!ctry) { addIssue(rowIndex, 12, 'Country is required.', ctry); }
                    else if (!config.ignoreCountryValidation && !/^[A-Z]{2}$/.test(ctry)) { 
                        addIssue(rowIndex, 12, 'Country must be 2 uppercase letters.', ctry); 
                    }
                })();
                
                // 14: Contact Phone
                (function () {
                    var v = val(14);
                    if (v && v.replace(/\D/g, '').length !== 10) addIssue(rowIndex, 14, 'Contact must be exactly 10 digits.', v);
                })();
                
                // 15: Order Type & 16: Service Level
                (function () {
                    var ot = val(15);
                    if (!ot) { addIssue(rowIndex, 15, 'Order Type is required.', ot); }
                    else if (!config.ignoreOrderType && !{GO:1, GR:1, PA:1, DO:1}[ot]) addIssue(rowIndex, 15, 'Must be GO, GR, PA, or DO.', ot);
                    
                    var sl = val(16);
                    if (sl && !config.ignoreServiceLevel) {
                        var allowedSL = ['BEST', 'NEXT', '2DAY', '3DAY', 'MAIL', 'GND', 'ITG', 'ITGF', 'ATLAS', 'NDS', 'TTI', 'STORU', 'UPS', 'PCL'];
                        if (allowedSL.indexOf(sl) === -1) {
                            addIssue(rowIndex, 16, 'Strict Service Level required (BEST, NEXT, 2DAY, 3DAY, MAIL, GND, ITG, ITGF, ATLAS, NDS, TTI, STORU, UPS, PCL).', sl); 
                        }
                    }
                })();
                
                // 17, 18, 19, 20: Dates and Logic
                (function () { 
                    if (val(17) !== 'O') addIssue(rowIndex, 17, 'Allocation Rule must be "O".', val(17)); 
                    
                    var inHands = val(18), mustShip = val(20);
                    if (!inHands && !mustShip) { addIssue(rowIndex, 18, 'Customer In Hands or Must Ship Date required.', ''); } 
                    else {
                        if (inHands && !/^\d{2}\.\d{2}\.\d{4}$/.test(inHands)) addIssue(rowIndex, 18, 'Format must be MM.DD.YYYY.', inHands);
                        if (mustShip && !/^\d{2}\.\d{2}\.\d{4}$/.test(mustShip)) addIssue(rowIndex, 20, 'Format must be MM.DD.YYYY.', mustShip);
                    }
                    var ind = val(19); if (ind !== 'O' && ind !== 'B') addIssue(rowIndex, 19, 'Indicator must be O or B.', ind); 
                    var ao = val(21); if (ao !== 'Y' && ao !== 'N') addIssue(rowIndex, 21, 'Must be Y or N.', ao); 
                    if (val(23)) addIssue(rowIndex, 23, 'Should be blank for standard LOD.', val(23)); 
                })();
                
                // 25, 26, 27: Strict Emails and Site
                (function () {
                    var conf = val(25), shipConf = val(26), site = val(27);
                    var allowedTLDs = ['com', 'org', 'net', 'edu', 'gov', 'mil', 'us', 'info', 'biz'];

                    function validateEmailField(v, colIndex) {
                        if (!v) return;
                        var parts = v.split(';');
                        for (var j = 0; j < parts.length; j++) {
                            var email = parts[j].trim();
                            if (!email) continue;
                            if (email.indexOf(' ') !== -1) addIssue(rowIndex, colIndex, 'Email cannot contain spaces.', email);
                            
                            if (!config.ignoreEmailValidation) {
                                if (email.indexOf(',com') !== -1) addIssue(rowIndex, colIndex, 'Contains invalid comma (,com).', email);
                                if (email.indexOf('@') === -1) {
                                    addIssue(rowIndex, colIndex, 'Missing "@" symbol.', email);
                                } else {
                                    var domainPart = email.split('@')[1] || '';
                                    if (domainPart.indexOf('.') === -1) {
                                        addIssue(rowIndex, colIndex, 'Domain missing dot (e.g. .com, .org).', email);
                                    } else {
                                        var tld = domainPart.split('.').pop().toLowerCase();
                                        if (allowedTLDs.indexOf(tld) === -1) {
                                            addIssue(rowIndex, colIndex, 'Invalid or International TLD (.' + tld + '). Allowed: .com, .org, .net, .edu, .gov, .mil, .us', email);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    validateEmailField(conf, 25);
                    validateEmailField(shipConf, 26);
                    if ((conf || shipConf) && !site) addIssue(rowIndex, 27, 'Site required when email is provided.', site);
                })();
            }

            return { 
                mode: mode, 
                header: header, 
                rows: rows, 
                dataRows: dataRows, 
                dataRowCount: dataRows.length, 
                errorRowCount: Object.keys(errorRowSet).length, 
                issues: issues 
            };
        }

        // --- Export Utilities ---
        function buildClipboardSummary(result) {
            if (!result) return '';
            var lines = [
                'LOD Validation Results', 
                'Mode: ' + (result.mode || 'LOD'), 
                'Total data rows: ' + (result.dataRowCount || 0), 
                'Rows with issues: ' + (result.errorRowCount || 0), 
                'Total issues: ' + ((result.issues && result.issues.length) || 0), 
                ''
            ];
            if (!result.issues || !result.issues.length) { lines.push('Passed.'); return lines.join('\n'); }
            lines.push('Issues:');
            for (var i = 0; i < result.issues.length; i++) {
                var issue = result.issues[i];
                var line = 'Row ' + issue.row + ' – ' + (issue.columnName || ('Column ' + (issue.columnIndex + 1))) + ' – ' + issue.message;
                if (issue.value != null && String(issue.value).trim() !== '') {
                    line += ' (Value: ' + String(issue.value) + ')';
                }
                lines.push(line);
            }
            return lines.join('\n');
        }

        function fallbackCopyText(text) {
            var textarea = document.createElement('textarea'); 
            textarea.value = text; 
            document.body.appendChild(textarea); 
            textarea.select(); 
            document.execCommand('copy'); 
            document.body.removeChild(textarea); 
            setStatus('Results copied.', false, true);
        }

        function buildIssueCsv(result) {
            var lines = ['Row,Column,Value,Issue'];
            for (var i = 0; i < result.issues.length; i++) {
                var issue = result.issues[i];
                lines.push([
                    String(issue.row), 
                    csvQuote(issue.columnName || ''), 
                    csvQuote(issue.value == null ? '' : String(issue.value)), 
                    csvQuote(issue.message || '')
                ].join(','));
            }
            return lines.join('\r\n');
        }

        function csvQuote(value) {
            var v = String(value == null ? '' : value);
            return /[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
        }

        function buildHtmlReport(result) {
            var badCellMap = {};
            for (var i = 0; i < result.issues.length; i++) {
                badCellMap[result.issues[i].row + ':' + result.issues[i].columnIndex] = true;
            }
            
            var html = [
                '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>LOD Validation Report</title>',
                '<style>body { font-family: system-ui, sans-serif; background:#f8fafc; color:#0f172a; padding:2rem; } ',
                'table { width:100%; border-collapse:collapse; margin-top:1rem; font-size:0.85rem; background:#fff; white-space:nowrap; } ',
                'th, td { border:1px solid #e2e8f0; padding:6px 10px; text-align:left; } ',
                'th { background:#0f172a; color:#fff; position:sticky; top:0; } ',
                'td.bad-cell { background:#fef2f2; color:#ef4444; font-weight:700; }</style></head><body>',
                '<h1>Validation Report</h1><div style="overflow-x:auto;"><table><thead><tr><th>Line</th>'
            ];
            
            for (var h = 0; h < result.header.length; h++) { html.push('<th>' + escapeHtml(String(result.header[h] || '')) + '</th>'); }
            html.push('</tr></thead><tbody>');

            for (var r = 1; r < result.rows.length; r++) {
                var row = result.rows[r] || []; var rowIndex = r + 1;
                html.push('<tr><td>' + String(rowIndex) + '</td>');
                for (var c = 0; c < result.header.length; c++) {
                    var cellValue = String(row[c] == null ? '' : row[c]).replace(/[\uFFFD]/g, '').replace(/[^\x20-\x7E]/g, '');
                    html.push('<td' + (badCellMap[rowIndex + ':' + c] ? ' class="bad-cell"' : '') + '>' + escapeHtml(cellValue) + '</td>');
                }
                html.push('</tr>');
            }
            return html.join('') + '</tbody></table></div></body></html>';
        }

        function downloadTextFile(content, filename, mimeType) {
            var blob = new Blob([content], { type: mimeType || 'text/plain' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a'); 
            a.href = url; 
            a.download = filename || 'download.txt';
            document.body.appendChild(a); 
            a.click(); 
            document.body.removeChild(a); 
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }

        function buildSuggestedFilename(result, fallback) { 
            return (result && result.mode ? String(result.mode).toUpperCase() : 'LOD') + '-' + fallback; 
        }
        
        function escapeHtml(str) { 
            return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); 
        }
    