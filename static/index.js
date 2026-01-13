document.addEventListener('DOMContentLoaded', () => {
    loadTheme(); 
    loadsettings();
});

async function uploadPayload() {
  try {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const statusEl = document.getElementById('uploadStatus');

    if (!file) {
      statusEl.textContent = 'Please select a file first';
      statusEl.className = "text-xs text-right mb-2 text-red-500 font-bold";
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    statusEl.textContent = `Uploading ${file.name}...`;
    statusEl.className = "text-xs text-right mb-2 text-brand-light animate-pulse";

    const response = await fetch('/upload_payload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);

    const result = await response.json();
    
    statusEl.textContent = 'Upload successful';
    statusEl.className = "text-xs text-right mb-2 text-green-500 font-bold";

    fileInput.value = ""; 
    loadpayloads();

    setTimeout(() => {
        statusEl.textContent = "";
    }, 3000);

  } catch (error) {
    console.error('Upload error:', error);
    document.getElementById('uploadStatus').textContent = 'Upload failed';
    document.getElementById('uploadStatus').className = "text-xs text-right mb-2 text-red-500 font-bold";
  }
}

async function saveIP() {
    const ipInput = document.getElementById("IP");
    const ipValue = ipInput.value;
    if (ipValue.trim() !== "") {
        localStorage.setItem("savedIP", ipValue);
        setip(ipValue);
    }
}

async function loadIP() {
    const savedIP = localStorage.getItem("savedIP");
    if (savedIP) {
        document.getElementById("IP").value = savedIP;
        setip(savedIP);
    }
}

async function saveAJB() {
    const checkbox = document.getElementById("AJB-B");
    const isChecked = checkbox.checked;
    localStorage.setItem("savedAJB", isChecked);
    setajb(isChecked.toString());
}

async function loadAJB() {
    const savedAJB = localStorage.getItem("savedAJB");
    const checkbox = document.getElementById("AJB-B");
    const isTrue = (savedAJB === "true");
    checkbox.checked = isTrue;
    setajb(isTrue.toString());
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

async function SendPayload(str="") {
    const btn = document.getElementById('SJB');
    const originalText = btn.innerText;

    try {
        if(!str) {
            btn.innerText = "SENDING...";
            btn.disabled = true;
            btn.classList.add('opacity-75');
        }

        const response = await fetch('/send_payload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                payload: str,
                IP: localStorage.getItem("savedIP")
            })
        });

        const text = await response.text();
        
        if(!str) {
            alert('Jailbreak command sent.');
        } else {
            console.log("Payload sent: " + str);
        }
        
        return text;
    } catch (error) {
        alert('Error: ' + error);
    } finally {
        if(!str) {
            btn.innerText = originalText;
            btn.disabled = false;
            btn.classList.remove('opacity-75');
        }
    }
}

async function DeletePayload(str) {
    if(!confirm(`Delete ${str}?`)) return;

    try {
        await fetch('/delete_payload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payload: str })
        });
        loadpayloads();
    } catch (error) {
        alert(error);
    }
}

function loadsettings() {
    loadIP();
    loadAJB();
    loadpayloads();
}

async function loadpayloads() {
    try {
        const response = await fetch('/list_payloads');
        const files = await response.json();
        const listElement = document.getElementById('PL');
        
        listElement.innerHTML = ''; 

        if (!files || files.length === 0) {
            document.getElementById('empty-state').classList.remove('hidden');
            return;
        }

        document.getElementById('empty-state').classList.add('hidden');

        files.forEach(file => {
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

                <div class="flex items-center gap-2">
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