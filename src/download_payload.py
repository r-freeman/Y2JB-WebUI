import requests
import os
from werkzeug.utils import secure_filename
import re

def handle_url_download(url, payload_dir, allowed_extensions):
    if not url:
        return {'error': 'No URL provided'}, 400
        
    try:
        if not url.startswith(('http://', 'https://')):
            return {'error': 'Invalid URL scheme'}, 400
            
        print(f"Downloading from: {url}")
        response = requests.get(url, stream=True, timeout=10)
        response.raise_for_status()
        
        filename = None
        if "Content-Disposition" in response.headers:
            fname = re.findall("filename=(.+)", response.headers["Content-Disposition"])
            if fname:
                filename = fname[0].strip(' "')
        
        if not filename:
            filename = url.split("/")[-1]
            if '?' in filename:
                filename = filename.split('?')[0]
            
        filename = secure_filename(filename)
        
        ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
        if not ext or ext not in allowed_extensions:
            return {'error': f'File type {ext} not allowed from URL'}, 400
             
        save_path = os.path.join(payload_dir, filename)
        
        with open(save_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                
        return {'success': True, 'filename': filename}, 200
        
    except Exception as e:
        return {'error': str(e)}, 500
