import os

def handle_delete_payload(data, payload_dir, allowed_extensions):
    payload = data.get("payload")
    if not payload:
        return {'error': 'filename parameter is required'}, 400

    if '..' in payload or '/' in payload or '\\' in payload:
        return {'error': 'Invalid filename'}, 400

    file_extension = payload.rsplit('.', 1)[-1].lower()
    if file_extension not in allowed_extensions:
        return {'error': f'File type {file_extension} not allowed'}, 400

    filepath = os.path.join(payload_dir, payload)

    if os.path.exists(filepath) and os.path.isfile(filepath):
        try:
            os.remove(filepath)
            return {
                'success': True,
                'message': f'File {payload} deleted successfully',
                'filename': payload
            }, 200
        except Exception as e:
            return {'error': str(e), 'message': 'Failed to delete file'}, 500
    else:
        return {
            'error': 'File not found',
            'filename': payload
        }, 404
