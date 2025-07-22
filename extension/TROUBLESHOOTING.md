# 🔧 AI Resume Screener Troubleshooting Guide

## Quick Fixes

### 1. Extension Not Working
**Problem**: Extension installed but not functioning on Keka pages

**Solutions**:
- Refresh any open Keka pages after installation
- Check that Developer Mode is enabled in Chrome extensions
- Verify the extension appears in your toolbar (pin it if needed)
- Try opening the test page: `file:///path/to/extension/test.html`

### 2. No AI Screening Button
**Problem**: Can't find the "🤖 AI Screen Resume" button

**Solutions**:
- Make sure you're on a Keka candidates page (not just any page)
- Wait for the page to fully load (extension injects after page load)
- Look for the floating AI widget (🤖) in the bottom-right corner
- Try selecting candidates in the table first

### 3. API Key Issues
**Problem**: "API key required" or authentication errors

**Solutions**:
- Click the extension icon and configure your OpenAI API key
- Ensure your API key starts with `sk-` (not `pk-`)
- Check your OpenAI account has billing enabled
- Verify you have sufficient credits/quota

### 4. "No candidate information found"
**Problem**: AI screening fails to find candidate data

**Solutions**:
- Select candidates using checkboxes in the table
- Navigate to individual candidate profile pages
- Ensure the page has loaded completely
- Check that candidate data is visible on the page

## Advanced Troubleshooting

### Check Browser Console
1. Press `F12` to open Developer Tools
2. Go to the "Console" tab
3. Look for error messages (red text)
4. Common errors and solutions:

```
Error: "Failed to fetch" 
→ Check internet connection and API key

Error: "Rate limit exceeded"
→ Wait 1 minute and try again

Error: "Invalid API key"
→ Reconfigure your OpenAI API key
```

### Test Extension Functionality
1. Open the test page: `extension/test.html`
2. Click "Check Extension" - should show green checkmark
3. Click "Test API Key" - should confirm key is configured
4. Try the test screening buttons

### Verify Extension Permissions
1. Go to `chrome://extensions/`
2. Find "AI Resume Screener for Keka"
3. Click "Details"
4. Ensure it has permission to access Keka domains

### Reset Extension
If all else fails:
1. Remove the extension from Chrome
2. Clear browser cache and cookies
3. Reinstall the extension
4. Reconfigure your API key

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Extension not detected" | Extension not installed/enabled | Install and enable extension |
| "API key required" | No OpenAI API key configured | Add API key in extension popup |
| "Rate limit exceeded" | Too many API requests | Wait and try again |
| "Insufficient resume content" | No candidate data found | Select candidates or go to profile page |
| "Failed to inject content script" | Page compatibility issue | Refresh page or try different Keka page |

## Performance Tips

### Optimize API Usage
- Use bulk screening for multiple candidates
- Avoid rapid successive requests
- Consider upgrading OpenAI plan for higher limits

### Browser Performance
- Close unnecessary tabs
- Disable other extensions temporarily
- Use latest Chrome version

## Getting Help

### Before Contacting Support
1. Try the troubleshooting steps above
2. Check the browser console for specific errors
3. Test with the included test page
4. Note your Chrome version and OS

### What to Include in Support Requests
- Specific error messages from console
- Steps to reproduce the issue
- Screenshots of the problem
- Your Chrome version and operating system
- Whether the test page works

### Contact Information
- Create an issue in the project repository
- Include all relevant details and error messages
- Attach screenshots if helpful

## FAQ

**Q: Does this work with all versions of Keka?**
A: The extension is designed to work with modern Keka interfaces. Some older versions may need manual configuration.

**Q: Can I use this with other ATS systems?**
A: Currently optimized for Keka, but the code can be adapted for other systems.

**Q: Is my data secure?**
A: Yes, all data processing happens locally or through OpenAI's secure API. No data is stored by the extension.

**Q: Why do I need an OpenAI API key?**
A: The AI analysis is powered by OpenAI's GPT models, which require an API key for access.

**Q: How much does it cost to use?**
A: The extension is free, but you pay for OpenAI API usage (typically $0.01-0.03 per candidate screening).