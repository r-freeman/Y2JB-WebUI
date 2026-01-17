document.addEventListener('DOMContentLoaded', () => {
    loadPayloadManager();
});

async function loadPayloadManager() {
    const container = document.getElementById('payload-autoload-list');
    if (!container) return;

    container.innerHTML = '<div class="text-center py-4 text-xs opacity-50"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</div>';

    try {
        const [filesRes, configRes] = await Promise.all([
            fetch('/list_payloads'),
            fetch('/api/payload_config')
        ]);
        
        const files = await filesRes.json();
        const config = await configRes.json();

        container.innerHTML = ''; 

        if (!files || files.length === 0) {
            container.innerHTML = '<p class="text-xs opacity-50 p-4 text-center">No payloads found.</p>';
            return;
        }

        files.forEach(file => {
            const isEnabled = config[file.split('/').pop()] !== false && config[file] !== false; 
            const configKey = file.split('/').pop(); 
            const checked = config[configKey] !== false; 

            const item = document.createElement('div');
            item.className = "flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5 group hover:border-brand-blue/30 transition-colors";
            
            item.innerHTML = `
                <div class="flex items-center gap-3 overflow-hidden">
                    <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-brand-light">
                        <i class="fa-solid fa-microchip text-xs"></i>
                    </div>
                    <div class="flex flex-col overflow-hidden">
                        <span class="text-xs font-bold truncate" title="${file}">${file}</span>
                        <span class="text-[10px] opacity-40">Payload</span>
                    </div>
                </div>
                
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" class="sr-only peer" onchange="togglePayloadAutoload('${configKey}', this)" ${checked ? 'checked' : ''}>
                    <div class="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-blue"></div>
                </label>
            `;
            container.appendChild(item);
        });

    } catch (e) {
        console.error(e);
        container.innerHTML = '<p class="text-xs text-red-400 p-4 text-center">Failed to load payloads</p>';
    }
}

async function togglePayloadAutoload(filename, checkbox) {
    const enabled = checkbox.checked;
    
    try {
        const response = await fetch('/api/payload_config/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, enabled })
        });
        
        if (!response.ok) throw new Error("API Error");
        
    } catch (e) {
        console.error(e);
        showToast('Failed to save preference', 'error');
        checkbox.checked = !enabled; 
    }
}