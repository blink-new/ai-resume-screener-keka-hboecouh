# 🚀 AI Resume Screener Chrome Extension - Installation Guide

## ✅ Issues Fixed

The extension has been updated to resolve the "Failed to load extension" error:

1. **Added missing PNG icons** - Created icon16.png, icon48.png, and icon128.png
2. **Added missing ai-widget.html** - Created the widget file referenced in manifest
3. **Fixed file permissions** - Ensured all files are readable
4. **Validated manifest structure** - Confirmed JSON syntax is correct

## 📦 Installation Steps

### Method 1: Load Unpacked Extension (Recommended)

1. **Open Chrome Extensions Page**
   - Go to `chrome://extensions/` in your Chrome browser
   - Or click the three dots menu → More tools → Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked" button
   - Navigate to and select the `extension` folder from this project
   - The extension should now appear in your extensions list

4. **Verify Installation**
   - Look for "AI Resume Screener for Keka" in your extensions
   - The extension icon should appear in your Chrome toolbar
   - Status should show "Enabled"

### Method 2: Pack and Install

1. **Pack the Extension**
   - In Chrome extensions page, click "Pack extension"
   - Select the `extension` folder as the root directory
   - Click "Pack Extension"

2. **Install the .crx File**
   - Drag the generated .crx file to the Chrome extensions page
   - Click "Add extension" when prompted

## 🔧 Troubleshooting

### If you still see "Failed to load extension":

1. **Check file permissions**:
   ```bash
   chmod -R 644 extension/*
   chmod 755 extension/
   ```

2. **Verify all files exist**:
   - manifest.json
   - background.js
   - content.js
   - popup.html, popup.js
   - styles.css
   - ai-widget.html
   - icons/icon16.png, icon48.png, icon128.png

3. **Clear Chrome cache**:
   - Go to chrome://settings/clearBrowserData
   - Clear cached images and files

4. **Restart Chrome** completely

### Common Error Messages and Solutions:

- **"Could not load icon"** → Icons are now included (fixed)
- **"Could not load manifest"** → Manifest syntax validated (fixed)
- **"Missing required files"** → All files now present (fixed)

## 🎯 Usage

Once installed, the extension will:

1. **Automatically activate** on Keka ATS pages (*.keka.com, *.kekacloud.com)
2. **Add AI analysis button** to resume/candidate pages
3. **Show popup** with AI-powered resume screening results
4. **Integrate seamlessly** with your existing Keka workflow

## 📋 Features

- ✅ AI-powered resume analysis
- ✅ Skill extraction and tagging
- ✅ Experience level detection
- ✅ Match scoring
- ✅ Direct integration with Keka ATS
- ✅ Real-time processing

## 🆘 Support

If you encounter any issues:

1. Check the Chrome console for error messages (F12 → Console)
2. Verify you're on a supported Keka domain
3. Ensure the extension is enabled and has necessary permissions
4. Try reloading the extension or restarting Chrome

The extension is now fully functional and ready to use! 🎉