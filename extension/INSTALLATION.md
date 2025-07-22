# 🚀 Installation Guide - AI Resume Screener Browser Extension

## Quick Installation (Chrome Web Store)

**Coming Soon!** The extension will be available on the Chrome Web Store for one-click installation.

## Manual Installation (Developer Mode)

### **Prerequisites**
- Chrome browser (version 88+) or Firefox (version 109+)
- OpenAI API account with credits
- Access to Keka ATS platform

### **Step 1: Download Extension Files**

1. Download the extension folder from this repository
2. Extract to a folder on your computer (e.g., `~/Downloads/ai-resume-screener-extension/`)

### **Step 2: Install in Chrome**

1. **Open Chrome Extensions Page**
   - Go to `chrome://extensions/`
   - Or: Menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle "Developer mode" switch (top-right corner)

3. **Load Extension**
   - Click "Load unpacked"
   - Select the extension folder you downloaded
   - Extension should appear in your extensions list

4. **Pin Extension**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "AI Resume Screener" and click the pin icon
   - Extension icon should now appear in your toolbar

### **Step 3: Install in Firefox**

1. **Open Firefox Add-ons Page**
   - Go to `about:addons`
   - Or: Menu → Add-ons and Themes

2. **Load Temporary Add-on**
   - Click the gear icon → "Debug Add-ons"
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file from the extension folder

3. **Pin Extension**
   - Right-click the extension icon
   - Select "Pin to Toolbar"

### **Step 4: Configure API Key**

1. **Get OpenAI API Key**
   - Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)
   - **Important**: Keep this key secure and never share it

2. **Configure Extension**
   - Click the extension icon in your browser toolbar
   - If no API key is configured, you'll see a setup prompt
   - Click "Setup" and paste your API key
   - Click "Save"

### **Step 5: Test Installation**

1. **Navigate to Keka**
   - Go to your Keka ATS platform
   - Navigate to any candidate profile page

2. **Verify Extension is Working**
   - Look for the blue "🤖 AI Screen Resume" button
   - Extension icon should show "AI" badge
   - Floating 🤖 widget should appear in bottom-right corner

3. **Test Screening**
   - Click "🤖 AI Screen Resume" button
   - Should see analysis results in 3-5 seconds
   - Tags should be automatically added to the profile

## Troubleshooting

### **Extension Not Loading**

**Problem**: Extension doesn't appear after installation
**Solutions**:
- Refresh the extensions page (`chrome://extensions/`)
- Check that all files are in the extension folder
- Ensure `manifest.json` is in the root of the folder
- Try disabling and re-enabling the extension

### **No AI Button Appears**

**Problem**: Can't find the screening button on Keka pages
**Solutions**:
- Refresh the Keka page
- Check that you're on a candidate profile page (URL contains `/candidate` or `/applicant`)
- Look for the floating 🤖 widget in bottom-right corner
- Check browser console for errors (F12 → Console)

### **API Key Issues**

**Problem**: "Invalid API key" or "API quota exceeded" errors
**Solutions**:
- Verify API key starts with `sk-` and is copied correctly
- Check OpenAI account has available credits
- Try generating a new API key
- Ensure API key has proper permissions

### **Screening Fails**

**Problem**: AI analysis fails or returns errors
**Solutions**:
- Check internet connection
- Verify candidate page has resume content
- Try refreshing page and screening again
- Check if OpenAI API is experiencing issues

### **Permission Errors**

**Problem**: Extension can't access Keka pages
**Solutions**:
- Check that Keka domain is in the allowed hosts
- Try reloading the extension
- Ensure you're on a supported Keka domain (*.keka.com, *.kekacloud.com)

## Advanced Configuration

### **Custom Keka Domains**

If your Keka instance uses a custom domain:

1. Edit `manifest.json`
2. Add your domain to `host_permissions` and `content_scripts.matches`:
   ```json
   "host_permissions": [
     "https://*.keka.com/*",
     "https://*.kekacloud.com/*",
     "https://your-custom-domain.com/*"
   ]
   ```
3. Reload the extension

### **Proxy Configuration**

For corporate networks with proxies:

1. Extension uses browser's proxy settings automatically
2. Ensure OpenAI API (`api.openai.com`) is accessible
3. Check with IT team if API calls are blocked

### **Performance Tuning**

To optimize for your usage:

1. **Rate Limiting**: Extension waits 1 second between bulk screening requests
2. **Cost Control**: Uses GPT-4o-mini model for cost efficiency
3. **Caching**: Results are cached to avoid re-analysis

## Security & Privacy

### **Data Protection**
- ✅ API keys stored locally in browser (encrypted)
- ✅ No data sent to our servers
- ✅ Direct communication with OpenAI only
- ✅ No tracking or analytics

### **Permissions Explained**
- **activeTab**: Access current Keka page content
- **storage**: Store API key and settings locally
- **scripting**: Inject AI screening functionality
- **host_permissions**: Access Keka domains only

### **Best Practices**
- Use dedicated OpenAI API key for this extension
- Regularly rotate API keys
- Monitor OpenAI usage dashboard
- Keep extension updated

## Updates

### **Automatic Updates** (Chrome Web Store)
- Extension updates automatically when published
- New features and bug fixes delivered seamlessly

### **Manual Updates** (Developer Mode)
1. Download latest extension files
2. Replace existing folder
3. Go to `chrome://extensions/`
4. Click "Reload" button for the extension

## Support

### **Getting Help**
- 📧 Email: support@ai-resume-screener.com
- 🐛 GitHub Issues: [Report bugs](https://github.com/ai-resume-screener/issues)
- 💬 Discord: [Join community](https://discord.gg/ai-resume-screener)

### **Feature Requests**
- 💡 GitHub Discussions: [Request features](https://github.com/ai-resume-screener/discussions)
- 📝 Email: features@ai-resume-screener.com

---

**🎉 Congratulations!** You're now ready to screen candidates with AI-powered efficiency. Transform your hiring process and find the best talent faster than ever before.

**Next Steps:**
1. Navigate to a Keka candidate profile
2. Click the "🤖 AI Screen Resume" button
3. Review the comprehensive AI analysis
4. Use tags and scores to filter candidates
5. Export qualified candidates to your hiring pipeline

*Happy screening! 🚀*