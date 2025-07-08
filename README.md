# Video Downloader Website

A modern, responsive web application for downloading videos from YouTube and Instagram. Built with Flask (Python) backend and vanilla JavaScript frontend.

![Video Downloader](https://img.shields.io/badge/Video-Downloader-blue)
![Python](https://img.shields.io/badge/Python-3.7+-green)
![Flask](https://img.shields.io/badge/Flask-2.3+-red)
![License](https://img.shields.io/badge/License-Educational-yellow)

## 🚀 Features

- **Multi-Platform Support**: Download videos from YouTube and Instagram
- **Quality Selection**: Choose from multiple video qualities (480p, 720p, 1080p)
- **Real-time Progress**: Track download progress with speed indicators
- **Modern UI**: Beautiful, responsive design with smooth animations
- **Video Preview**: See video thumbnails, titles, and metadata before downloading
- **Fast Downloads**: Optimized download process using yt-dlp
- **Mobile Friendly**: Fully responsive design that works on all devices

## 🛠️ Installation

### Prerequisites

- Python 3.7 or higher
- pip (Python package installer)

### Setup Instructions

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd video-downloader
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python app.py
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000`

## 📱 Usage

1. **Enter Video URL**: Paste a YouTube or Instagram video URL into the input field
2. **Get Video Info**: Click "Get Info" to preview the video details and available qualities
3. **Select Quality**: Choose your preferred video quality from the dropdown
4. **Download**: Click "Download Video" and watch the real-time progress
5. **Success**: Your video will be downloaded to the `downloads/` directory

### Supported URLs

- **YouTube**: 
  - `https://www.youtube.com/watch?v=VIDEO_ID`
  - `https://youtu.be/VIDEO_ID`
- **Instagram**: 
  - `https://www.instagram.com/p/POST_ID/`
  - `https://www.instagram.com/reel/REEL_ID/`

## 🏗️ Project Structure

```
video-downloader/
├── app.py                 # Flask backend application
├── requirements.txt       # Python dependencies
├── README.md             # Project documentation
├── downloads/            # Downloaded videos directory
├── templates/
│   └── index.html        # Main HTML template
├── static/
│   ├── css/
│   │   └── style.css     # Stylesheet
│   └── js/
│       └── main.js       # JavaScript functionality
```

## 🔧 Configuration

### Quality Settings

The application supports three quality presets:

- **Best**: Up to 1080p resolution
- **Medium**: Up to 720p resolution  
- **Low**: Up to 480p resolution

### Download Directory

By default, videos are saved to the `downloads/` directory in the project root. You can modify this in `app.py`:

```python
DOWNLOAD_DIR = 'downloads'  # Change this path as needed
```

## 🚀 Deployment

### Local Development
```bash
python app.py
```

### Production (using Gunicorn)
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Docker (Optional)
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["python", "app.py"]
```

## ⚠️ Important Legal Notice

**This tool is for educational and personal use only.** Please be aware of and respect:

- **Copyright Laws**: Only download content you have permission to download
- **Terms of Service**: Respect the terms of service of YouTube, Instagram, and other platforms
- **Fair Use**: Use downloaded content responsibly and in accordance with fair use guidelines
- **Personal Use**: This tool is intended for personal, non-commercial use only

### Recommended Use Cases

✅ **Allowed**:
- Downloading your own content
- Educational purposes with proper permissions
- Backing up content you have rights to
- Personal offline viewing of permitted content

❌ **Not Recommended**:
- Redistributing copyrighted content
- Commercial use of downloaded videos
- Violating platform terms of service
- Mass downloading of content

## 🔒 Privacy & Security

- **No Data Storage**: URLs and video information are not permanently stored
- **Local Processing**: All downloads happen locally on your machine
- **No User Tracking**: No analytics or user tracking implemented
- **Secure Connections**: All external requests use HTTPS

## 🐛 Troubleshooting

### Common Issues

1. **"Failed to get video info"**
   - Check if the URL is valid and accessible
   - Ensure you have internet connectivity
   - Try a different video URL

2. **Download fails**
   - Check available disk space
   - Ensure the downloads directory is writable
   - Try a different quality setting

3. **Slow downloads**
   - Check your internet connection
   - Try during off-peak hours
   - Select a lower quality option

### Error Logs

Check the terminal/console where you're running the Flask app for detailed error messages.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is for educational purposes. Please use responsibly and in accordance with applicable laws and platform terms of service.

## 🆘 Support

If you encounter issues or have questions:

1. Check the troubleshooting section above
2. Look at existing issues in the repository
3. Create a new issue with detailed information about your problem

## 🙏 Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Powerful video downloading library
- [Flask](https://flask.palletsprojects.com/) - Web framework
- [Font Awesome](https://fontawesome.com/) - Icons
- [Google Fonts](https://fonts.google.com/) - Typography

---

**Remember**: Always respect copyright laws and platform terms of service when using this tool.