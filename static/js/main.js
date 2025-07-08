// DOM elements
const videoUrlInput = document.getElementById('videoUrl');
const getInfoBtn = document.getElementById('getInfoBtn');
const downloadBtn = document.getElementById('downloadBtn');
const qualitySelect = document.getElementById('quality');

// Sections
const videoInfoSection = document.getElementById('videoInfo');
const progressSection = document.getElementById('progressSection');
const successSection = document.getElementById('successSection');
const errorSection = document.getElementById('errorSection');

// Video info elements
const videoThumbnail = document.getElementById('videoThumbnail');
const videoTitle = document.getElementById('videoTitle');
const videoUploader = document.getElementById('videoUploader');
const videoDuration = document.getElementById('videoDuration');

// Progress elements
const progressPercent = document.getElementById('progressPercent');
const progressFill = document.getElementById('progressFill');
const downloadSpeed = document.getElementById('downloadSpeed');
const downloadStatus = document.getElementById('downloadStatus');

// Error elements
const errorMessage = document.getElementById('errorMessage');

// Other buttons
const downloadAnotherBtn = document.getElementById('downloadAnotherBtn');
const tryAgainBtn = document.getElementById('tryAgainBtn');

// State
let currentDownloadId = null;
let progressInterval = null;

// Event listeners
getInfoBtn.addEventListener('click', getVideoInfo);
downloadBtn.addEventListener('click', startDownload);
downloadAnotherBtn.addEventListener('click', resetForm);
tryAgainBtn.addEventListener('click', resetForm);

// Enter key support for URL input
videoUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getVideoInfo();
    }
});

// Auto-detect paste and get info
videoUrlInput.addEventListener('paste', () => {
    setTimeout(() => {
        if (isValidUrl(videoUrlInput.value.trim())) {
            getVideoInfo();
        }
    }, 100);
});

// Utility functions
function isValidUrl(url) {
    try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname.toLowerCase();
        const supportedDomains = [
            'youtube.com', 'www.youtube.com', 'youtu.be',
            'instagram.com', 'www.instagram.com'
        ];
        return supportedDomains.some(d => domain.includes(d));
    } catch {
        return false;
    }
}

function formatDuration(seconds) {
    if (!seconds) return 'Unknown';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

function formatFileSize(bytes) {
    if (!bytes) return 'Unknown size';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function hideAllSections() {
    videoInfoSection.classList.add('hidden');
    progressSection.classList.add('hidden');
    successSection.classList.add('hidden');
    errorSection.classList.add('hidden');
}

function showError(message) {
    hideAllSections();
    errorMessage.textContent = message;
    errorSection.classList.remove('hidden');
}

function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.classList.add('loading');
        const originalText = button.innerHTML;
        button.dataset.originalText = originalText;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    } else {
        button.disabled = false;
        button.classList.remove('loading');
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
            delete button.dataset.originalText;
        }
    }
}

// Main functions
async function getVideoInfo() {
    const url = videoUrlInput.value.trim();
    
    if (!url) {
        showError('Please enter a video URL');
        return;
    }
    
    if (!isValidUrl(url)) {
        showError('Please enter a valid YouTube or Instagram URL');
        return;
    }
    
    setButtonLoading(getInfoBtn, true);
    hideAllSections();
    
    try {
        const response = await fetch('/info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to get video information');
        }
        
        displayVideoInfo(data);
        
    } catch (error) {
        console.error('Error getting video info:', error);
        showError(error.message || 'Failed to get video information');
    } finally {
        setButtonLoading(getInfoBtn, false);
    }
}

function displayVideoInfo(info) {
    // Set video details
    videoTitle.textContent = info.title;
    videoUploader.textContent = info.uploader;
    videoDuration.textContent = formatDuration(info.duration);
    
    // Set thumbnail
    if (info.thumbnail) {
        videoThumbnail.src = info.thumbnail;
        videoThumbnail.style.display = 'block';
    } else {
        videoThumbnail.style.display = 'none';
    }
    
    // Update quality options if available
    if (info.formats && info.formats.length > 0) {
        qualitySelect.innerHTML = '';
        
        // Sort by quality (height)
        const sortedFormats = info.formats.sort((a, b) => {
            const aHeight = parseInt(a.quality) || 0;
            const bHeight = parseInt(b.quality) || 0;
            return bHeight - aHeight;
        });
        
        sortedFormats.forEach(format => {
            const option = document.createElement('option');
            const sizeText = format.filesize ? ` (${formatFileSize(format.filesize)})` : '';
            option.value = format.quality.replace('p', '');
            option.textContent = `${format.quality} ${format.ext.toUpperCase()}${sizeText}`;
            qualitySelect.appendChild(option);
        });
    }
    
    videoInfoSection.classList.remove('hidden');
}

async function startDownload() {
    const url = videoUrlInput.value.trim();
    const quality = getQualityMapping(qualitySelect.value);
    
    if (!url) {
        showError('Please enter a video URL');
        return;
    }
    
    setButtonLoading(downloadBtn, true);
    hideAllSections();
    
    try {
        const response = await fetch('/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url, quality })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to start download');
        }
        
        currentDownloadId = data.download_id;
        showProgressSection();
        startProgressTracking();
        
    } catch (error) {
        console.error('Error starting download:', error);
        showError(error.message || 'Failed to start download');
        setButtonLoading(downloadBtn, false);
    }
}

function getQualityMapping(selectedValue) {
    if (!selectedValue) return 'best';
    
    const height = parseInt(selectedValue);
    if (height >= 1080) return 'best';
    if (height >= 720) return 'medium';
    if (height >= 480) return 'low';
    return 'best';
}

function showProgressSection() {
    hideAllSections();
    progressSection.classList.remove('hidden');
    
    // Reset progress
    progressPercent.textContent = '0%';
    progressFill.style.width = '0%';
    downloadSpeed.textContent = 'Preparing...';
    downloadStatus.textContent = 'Starting download...';
}

function startProgressTracking() {
    if (progressInterval) {
        clearInterval(progressInterval);
    }
    
    progressInterval = setInterval(async () => {
        if (!currentDownloadId) return;
        
        try {
            const response = await fetch(`/progress/${currentDownloadId}`);
            const data = await response.json();
            
            updateProgress(data);
            
            if (data.status === 'finished' || data.status === 'error') {
                clearInterval(progressInterval);
                progressInterval = null;
                
                if (data.status === 'finished') {
                    showSuccess();
                } else {
                    showError(data.error || 'Download failed');
                }
                
                setButtonLoading(downloadBtn, false);
                currentDownloadId = null;
            }
            
        } catch (error) {
            console.error('Error tracking progress:', error);
            clearInterval(progressInterval);
            progressInterval = null;
            showError('Failed to track download progress');
            setButtonLoading(downloadBtn, false);
            currentDownloadId = null;
        }
    }, 1000);
}

function updateProgress(data) {
    if (data.status === 'downloading') {
        const percent = data.percent || '0%';
        const speed = data.speed || 'Unknown';
        
        progressPercent.textContent = percent;
        progressFill.style.width = percent;
        downloadSpeed.textContent = `Speed: ${speed}`;
        downloadStatus.textContent = 'Downloading...';
    } else if (data.status === 'finished') {
        progressPercent.textContent = '100%';
        progressFill.style.width = '100%';
        downloadSpeed.textContent = 'Complete';
        downloadStatus.textContent = 'Download finished!';
    }
}

function showSuccess() {
    hideAllSections();
    successSection.classList.remove('hidden');
}

function resetForm() {
    hideAllSections();
    videoUrlInput.value = '';
    videoUrlInput.focus();
    
    // Clear any ongoing progress tracking
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
    currentDownloadId = null;
    
    // Reset button states
    setButtonLoading(getInfoBtn, false);
    setButtonLoading(downloadBtn, false);
}

// Auto-focus on URL input when page loads
document.addEventListener('DOMContentLoaded', () => {
    videoUrlInput.focus();
});

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
    resetForm();
});

// Prevent form submission on Enter key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
    }
});

// Handle visibility change (pause progress tracking when tab is hidden)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    } else if (!document.hidden && currentDownloadId && !progressInterval) {
        startProgressTracking();
    }
});