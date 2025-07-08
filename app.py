from flask import Flask, render_template, request, jsonify, send_file
import yt_dlp
import os
import tempfile
import threading
import time
from urllib.parse import urlparse
import json

app = Flask(__name__)

# Create downloads directory if it doesn't exist
DOWNLOAD_DIR = 'downloads'
if not os.path.exists(DOWNLOAD_DIR):
    os.makedirs(DOWNLOAD_DIR)

# Store download progress
download_progress = {}

class DownloadProgressHook:
    def __init__(self, download_id):
        self.download_id = download_id
    
    def __call__(self, d):
        if d['status'] == 'downloading':
            percent = d.get('_percent_str', 'N/A')
            speed = d.get('_speed_str', 'N/A')
            download_progress[self.download_id] = {
                'status': 'downloading',
                'percent': percent,
                'speed': speed
            }
        elif d['status'] == 'finished':
            download_progress[self.download_id] = {
                'status': 'finished',
                'filename': d['filename']
            }

def is_valid_url(url):
    """Check if URL is from supported platforms"""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        supported_domains = [
            'youtube.com', 'www.youtube.com', 'youtu.be',
            'instagram.com', 'www.instagram.com'
        ]
        return any(domain.endswith(d) for d in supported_domains)
    except:
        return False

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/download', methods=['POST'])
def download_video():
    data = request.get_json()
    url = data.get('url', '').strip()
    quality = data.get('quality', 'best')
    
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    
    if not is_valid_url(url):
        return jsonify({'error': 'Please provide a valid YouTube or Instagram URL'}), 400
    
    download_id = str(int(time.time() * 1000))
    
    # Start download in background thread
    thread = threading.Thread(target=download_video_background, args=(url, quality, download_id))
    thread.daemon = True
    thread.start()
    
    return jsonify({'download_id': download_id})

def download_video_background(url, quality, download_id):
    try:
        # Configure yt-dlp options
        ydl_opts = {
            'outtmpl': os.path.join(DOWNLOAD_DIR, '%(title)s.%(ext)s'),
            'progress_hooks': [DownloadProgressHook(download_id)],
        }
        
        # Set quality based on user preference
        if quality == 'best':
            ydl_opts['format'] = 'best[height<=1080]'
        elif quality == 'medium':
            ydl_opts['format'] = 'best[height<=720]'
        elif quality == 'low':
            ydl_opts['format'] = 'best[height<=480]'
        else:
            ydl_opts['format'] = 'best'
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
            
    except Exception as e:
        download_progress[download_id] = {
            'status': 'error',
            'error': str(e)
        }

@app.route('/progress/<download_id>')
def get_progress(download_id):
    progress = download_progress.get(download_id, {'status': 'not_found'})
    return jsonify(progress)

@app.route('/info', methods=['POST'])
def get_video_info():
    data = request.get_json()
    url = data.get('url', '').strip()
    
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    
    if not is_valid_url(url):
        return jsonify({'error': 'Please provide a valid YouTube or Instagram URL'}), 400
    
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            video_info = {
                'title': info.get('title', 'Unknown'),
                'duration': info.get('duration', 0),
                'uploader': info.get('uploader', 'Unknown'),
                'thumbnail': info.get('thumbnail', ''),
                'formats': []
            }
            
            # Get available formats
            if 'formats' in info:
                seen_qualities = set()
                for fmt in info['formats']:
                    if fmt.get('height') and fmt.get('ext') in ['mp4', 'webm']:
                        quality = f"{fmt['height']}p"
                        if quality not in seen_qualities:
                            video_info['formats'].append({
                                'quality': quality,
                                'ext': fmt['ext'],
                                'filesize': fmt.get('filesize', 0)
                            })
                            seen_qualities.add(quality)
            
            return jsonify(video_info)
            
    except Exception as e:
        return jsonify({'error': f'Failed to get video info: {str(e)}'}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)