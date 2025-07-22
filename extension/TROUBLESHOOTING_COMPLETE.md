# 🔧 AI Resume Screener Extension - Complete Troubleshooting Guide

## Common Issues & Solutions

### 1. Extension Not Working on Keka

**Symptoms:**
- Extension icon appears but nothing happens on Keka pages
- No AI screening button appears
- Bulk selection doesn't trigger any action

**Solutions:**

#### A. Reload the Extension
1. Go to `chrome://extensions/`
2. Find "AI Resume Screener for Keka"
3. Click the refresh icon (🔄)
4. Reload your Keka tab

#### B. Check Permissions
1. Click the extension icon in toolbar
2. Click the three dots menu
3. Select "Manage extension"
4. Ensure "Site access" is set to "On all sites" or includes your Keka domain

#### C. Verify Keka URL
The extension works on:
- `https://*.keka.com/*`
- `https://*.kekacloud.com/*`
- `http://localhost/*` (for testing)

If your Keka instance uses a different domain:
1. Contact support to add your domain
2. Or modify the manifest.json and reload

### 2. API Key Issues

**Symptoms:**
- "API key required" message
- Screening fails with authentication error

**Solutions:**

1. **Set API Key:**
   - Click extension icon
   - Click "Setup" when prompted
   - Enter your OpenAI API key
   - Save

2. **Verify API Key:**
   - Open extension popup
   - Check status indicator
   - Should show "✅ Ready to screen candidates"

3. **Get API Key:**
   - Go to [platform.openai.com](https://platform.openai.com)
   - Navigate to API Keys
   - Create new secret key
   - Copy and paste into extension

### 3. Content Script Not Loading

**Symptoms:**
- No floating action button (FAB)
- No bulk screening panel
- Extension seems inactive on page

**Solutions:**

1. **Manual Injection:**
   - Open Chrome DevTools (F12)
   - Go to Console tab
   - Run: `chrome.runtime.sendMessage({action: 'injectScript'})`

2. **Check Console Errors:**
   - Open DevTools Console
   - Look for red error messages
   - Common errors:
     - "Cannot read property of undefined" → Reload page
     - "Extension context invalidated" → Reload extension

3. **Clear Cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Clear site data: DevTools → Application → Clear Storage

### 4. Bulk Selection Not Working

**Symptoms:**
- Selecting candidates doesn't update counter
- FAB doesn't show selected count
- Screening button stays disabled

**Solutions:**

1. **Check Checkbox Selectors:**
   The extension looks for:
   - `input[type="checkbox"]`
   - `.candidate-checkbox`
   - `.select-candidate`
   
   If your Keka uses different classes, contact support.

2. **Trigger Manual Update:**
   - After selecting candidates, click anywhere on the page
   - This triggers the selection observer

3. **Debug Selection:**
   - Open Console
   - Run: `window.kekaAIBridge.updateSelectedCandidates()`
   - Check if count updates

### 5. Screening Fails

**Symptoms:**
- "Screening failed" error
- Progress stops midway
- No results displayed

**Solutions:**

1. **Check Network:**
   - Ensure stable internet connection
   - Check if OpenAI API is accessible
   - Try VPN if API is blocked

2. **API Limits:**
   - Check OpenAI usage dashboard
   - Ensure API key has credits
   - Consider rate limiting (wait between requests)

3. **Debug Mode:**
   - Open Console before screening
   - Watch for error messages
   - Screenshot errors for support

### 6. Results Not Displaying

**Symptoms:**
- Screening completes but no results modal
- Results modal is empty
- Export button doesn't work

**Solutions:**

1. **Check DOM:**
   - Results modal might be hidden behind other elements
   - Try: `document.querySelector('.ai-results-modal').style.zIndex = 99999`

2. **Manual Results:**
   - Open Console
   - Run: `console.log(window.kekaAIBridge.lastResults)`
   - Manually export if needed

## Advanced Debugging

### Enable Debug Mode

Add to Console:
```javascript
window.KEKA_AI_DEBUG = true;
```

This enables verbose logging for:
- Candidate extraction
- API calls
- Result processing

### Test Page

1. Open `extension/debug.html` in Chrome
2. Use testing tools to verify:
   - Extension detection
   - Storage access
   - API configuration
   - Content script injection

### Manual Testing

Test individual components:

```javascript
// Test candidate extraction
window.kekaAIBridge.updateSelectedCandidates();
console.log(window.kekaAIBridge.selectedCandidates);

// Test job extraction
window.kekaAIBridge.extractJobContext();
console.log(window.kekaAIBridge.currentJobContext);

// Test API
window.kekaAIBridge.simulateAutonomousScreening(
  [{name: 'Test', email: 'test@example.com'}],
  {title: 'Test Job'},
  'Test intake document'
).then(console.log);
```

## Getting Help

If issues persist:

1. **Collect Information:**
   - Chrome version
   - Extension version
   - Keka URL (domain only)
   - Console errors (screenshot)
   - Network tab errors

2. **Contact Support:**
   - Email: support@airesumescreener.com
   - Include collected information
   - Describe steps to reproduce

3. **Quick Fixes:**
   - Reinstall extension
   - Clear all Chrome data for Keka domain
   - Try in incognito mode (with extension enabled)
   - Test in new Chrome profile

## FAQ

**Q: Why doesn't the extension work on my Keka?**
A: Your Keka instance might use a custom domain. Contact support to add it.

**Q: Is my data secure?**
A: Yes. API keys are stored locally. Candidate data is processed via OpenAI API only.

**Q: Can I use GPT-3.5 instead of GPT-4?**
A: Yes. Edit `content.js` and change model to `gpt-3.5-turbo`.

**Q: How do I export results?**
A: Click "Export Results" in the results modal for CSV download.

**Q: Can I customize the screening criteria?**
A: Yes, through intake documents. Upload job descriptions for targeted screening.