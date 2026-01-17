document.addEventListener('DOMContentLoaded', () => {
    loadsettings();
    loadTheme(); 
    fetch("/api/network_info")
        .then(r => r.json())
        .then(info => {
            const serverIpEl = document.getElementById("server-ip");
            const clientIpEl = document.getElementById("client-ip");
            if (serverIpEl) serverIpEl.textContent = info.server_ip || "Unknown";
            if (clientIpEl) clientIpEl.textContent = info.client_ip || "Unknown";
        })
        .catch(() => {
            const serverIpEl = document.getElementById("server-ip");
            const clientIpEl = document.getElementById("client-ip");
            if (serverIpEl) serverIpEl.textContent = "Unknown";
            if (clientIpEl) clientIpEl.textContent = "Unknown";
        });
});

async function readJSON(filename) {
    try {
        const response = await fetch(filename);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching JSON:', error);
        throw error;
    }
}

async function getJSONValue(filename, property) {
    try {
        const data = await readJSON(filename);
        return data[property];
    } catch (error) {
        console.error('Error getting JSON value:', error);
        return null;
    }
}

async function uploadPayload() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const upBtn = document.getElementById('UPB');

    if (!file) {
        Toast.show('Please select a file first', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const originalText = upBtn.innerHTML;
    upBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';
    upBtn.disabled = true;

    try {
        const response = await fetch('/upload_payload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error(`Status ${response.status}`);

        Toast.show(`Successfully uploaded ${file.name}`, 'success');
        fileInput.value = ""; 
        await loadpayloads();

    } catch (error) {
        console.error('Upload error:', error);
        Toast.show('Upload failed: ' + error.message, 'error');
    } finally {
        upBtn.innerHTML = originalText;
        upBtn.disabled = false;
    }
}

async function saveIP() {
    const ipInput = document.getElementById("IP");
    const ipValue = ipInput.value;
    if (ipValue.trim() !== "") {
        setip(ipValue);
    }
}

async function loadIP() {
    try {
        const savedIP = await getJSONValue('static/config/settings.json', 'ip');
        // Better check to handle undefined values
        if (savedIP) {
            document.getElementById('IP').value = savedIP;
        } else {
            document.getElementById('IP').value = '';
        }
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('IP').innerHTML = 'Error loading IP';
    }
}

async function saveAJB() {
    const checkbox = document.getElementById("AJB-B");
    const isChecked = checkbox.checked;
    localStorage.setItem("savedAJB", isChecked);
    setajb(isChecked.toString());
}

async function loadAJB() {
    try {
        const savedAJB = await getJSONValue('static/config/settings.json', 'ajb');
        const checkbox = document.getElementById("AJB-B");
        const isTrue = (savedAJB === "true");
        checkbox.checked = isTrue;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('IP').innerHTML = 'Error loading IP';
    }
}

async function setajb(str) {
    await fetch('/edit_ajb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: str })
    });
}

async function setip(str) {
    await fetch('/edit_ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: str })
    });
}

async function saveFTPPort() {
    const portInput = document.getElementById("FTP_PORT");
    const portValue = portInput.value;
    if (portValue.trim() !== "") {
        await fetch('/edit_ftp_port', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: portValue })
        });
    }
}

async function loadFTPPort() {
    try {
        const savedPort = await getJSONValue('static/config/settings.json', 'ftp_port');
        if (savedPort) {
            document.getElementById('FTP_PORT').value = savedPort;
        } else {
            document.getElementById('FTP_PORT').value = '1337'; 
        }
    } catch (error) {
        console.error('Error loading FTP Port:', error);
    }
}

async function installDownload0() {
    const btn = document.getElementById('btn-update-dl0');
    const originalText = btn.innerHTML;
    
    if(!confirm("Install local download0.dat to PS5? Ensure you updated it in Repos first.")) return;

    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Installing...';
    btn.disabled = true;

    try {
        const response = await fetch('/tools/update_download0', { method: 'POST' });
        const data = await response.json();
        
        if (data.success) {
            Toast.show(data.message, 'success');
        } else {
            Toast.show('Error: ' + data.message, 'error');
        }
    } catch (error) {
        Toast.show('Connection Error: ' + error, 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function blockUpdates() {
    const btn = document.getElementById('btn-block-upd');
    const originalText = btn.innerHTML;
    
    if(!confirm("This will patch system files to block updates. Proceed?")) return;

    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Patching...';
    btn.disabled = true;

    try {
        const response = await fetch('/tools/block_updates', { method: 'POST' });
        const data = await response.json();
        
        if (data.success) {
            Toast.show(data.message, 'success');
        } else {
            Toast.show('Error: ' + data.message, 'error');
        }
    } catch (error) {
        Toast.show('Connection Error: ' + error, 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function SendPayload(str="") {
    const btn = document.getElementById('SJB');

    try {
        if(!str) {
            btn.disabled = true;
            btn.classList.add('opacity-80', 'cursor-wait');
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin text-3xl"></i><span>Running...</span>';
        } else {
            Toast.show('Sending payload...', 'info');
        }

        const response = await fetch('/send_payload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                payload: str,
                IP: document.getElementById('IP').value
            })
        });

        const data = await response.json();
        
        if (response.ok) {
             if(!str) Toast.show('Jailbreak command sent!', 'success');
             else Toast.show('Payload sent successfully', 'success');
        } else {
             Toast.show(data.error || 'Failed to send payload', 'error');
        }

    } catch (error) {
        Toast.show('Connection Error: ' + error, 'error');
    } finally {
        if(!str) {
            btn.disabled = false;
            btn.classList.remove('opacity-80', 'cursor-wait');
            btn.innerHTML = '<i class="fa-solid fa-bolt text-3xl"></i><span>Jailbreak</span>';
        }
    }
}

async function DeletePayload(str) {
    if(!confirm(`Delete ${str}?`)) return;

    try {
        const response = await fetch('/delete_payload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payload: str })
        });
        
        if(response.ok) {
            Toast.show(`${str} deleted`, 'success');
            await loadpayloads();
        } else {
            Toast.show('Failed to delete file', 'error');
        }
    } catch (error) {
        Toast.show(error.message, 'error');
    }
}

async function loadsettings() {
    await loadIP();
    await loadFTPPort();
    await loadAJB();
    await loadpayloads();
}

async function togglePayloadIndex(filename, checkbox) {
    const enabled = checkbox.checked;
    
    const configKey = filename.split('/').pop(); 

    try {
        const response = await fetch('/api/payload_config/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: configKey, enabled })
        });
        
        if(!response.ok) throw new Error("API Error");

        Toast.show(`${configKey} ${enabled ? 'enabled' : 'disabled'} for autoload`, 'info');

    } catch (e) {
        console.error(e);
        Toast.show('Failed to update setting', 'error');
        checkbox.checked = !enabled;
    }
}

async function loadpayloads() {
    try {
        const [filesRes, configRes] = await Promise.all([
            fetch('/list_payloads'),
            fetch('/api/payload_config')
        ]);
        
        const files = await filesRes.json();
        const config = await configRes.json();

        const listElement = document.getElementById('PL');
        const countElement = document.getElementById('payload-count');

        if (countElement) {
            countElement.textContent = files ? files.length : 0;
        }
        
        listElement.innerHTML = ''; 

        if (!files || files.length === 0) {
            document.getElementById('empty-state').classList.remove('hidden');
            return;
        }

        document.getElementById('empty-state').classList.add('hidden');

        files.forEach(file => {
            const configKey = file.split('/').pop();
            const isEnabled = config[configKey] !== false && config[file] !== false;

            const card = document.createElement('li');
            card.className = "input-field border rounded-xl p-4 flex items-center justify-between group transition-colors hover:border-brand-blue";
            
            card.innerHTML = `
                <div class="flex items-center gap-4 overflow-hidden">
                    <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <i class="fa-solid fa-microchip text-xl opacity-70"></i>
                    </div>
                    <div class="flex flex-col overflow-hidden">
                        <span class="font-medium text-sm truncate" title="${file}">${file}</span>
                        <span class="text-[10px] opacity-50 uppercase tracking-wide">Payload</span>
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <div class="flex items-center gap-2 border-r pr-3 border-gray-300 dark:border-gray-700" title="Enable Autoload">
                        <span class="text-[10px] opacity-40 font-bold uppercase hidden sm:inline">Auto</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" class="sr-only peer" onchange="togglePayloadIndex('${file}', this)" ${isEnabled ? 'checked' : ''}>
                            <div class="w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-brand-blue"></div>
                        </label>
                    </div>

                    <button onclick="SendPayload('payloads/${file}')" class="px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-brand-blue hover:text-white rounded-lg text-xs font-bold transition-colors">
                        LOAD
                    </button>
                    <button onclick="DeletePayload('${file}')" class="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
            listElement.appendChild(card);
        });
    } catch (e) {
        console.error(e);
    }
}

document.getElementById('SJB').addEventListener('click', function(event) {
    event.preventDefault();
    SendPayload();
});