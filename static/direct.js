async function directDownload() {
    const urlInput = document.getElementById('directUrlInput');
    const url = urlInput.value.trim();
    const statusEl = document.getElementById('uploadStatus'); 
    
    if (!url) {
         statusEl.textContent = 'Please enter a URL';
         statusEl.className = "text-xs text-right mb-2 text-red-500 font-bold";
         return;
    }
    
    statusEl.textContent = 'Downloading from URL...';
    statusEl.className = "text-xs text-right mb-2 text-brand-light animate-pulse";
    
    try {
        const response = await fetch('/download_payload_url', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({url: url})
        });
        
        const result = await response.json();
        
        if (response.ok) {
            statusEl.textContent = `Downloaded ${result.filename} successfully`;
            statusEl.className = "text-xs text-right mb-2 text-green-500 font-bold";
            urlInput.value = '';
            if(typeof loadpayloads === 'function') loadpayloads();
        } else {
            throw new Error(result.error || 'Download failed');
        }
    } catch (error) {
        statusEl.textContent = `Error: ${error.message}`;
        statusEl.className = "text-xs text-right mb-2 text-red-500 font-bold";
    }
    
    setTimeout(() => {
        if (statusEl.textContent.includes('success')) {
            statusEl.textContent = "";
        }
    }, 3000);
}
