async function UpdateY2JB() {
    const btn = document.getElementById('update-btn');
    const originalText = btn.innerHTML;
    
    try {
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Updating...';
        btn.disabled = true;

        const response = await fetch('/update_y2jb', { method: 'POST' });
        if (!response.ok) throw new Error(`Status ${response.status}`);

        const result = await response.json();
        
        if (result.success) {
            alert(result.message);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        alert(error.message);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}
