# OpenAI Integration Setup Guide

## ⚠️ IMPORTANT: API Key Security

**NEVER** share your API key publicly or commit it to source code. The key you shared should be immediately revoked and regenerated from your OpenAI dashboard.

## 🔐 Secure Setup Instructions

### 1. Revoke the Exposed Key
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Find the key starting with `sk-proj-aoY-...`
3. Click "Revoke" immediately
4. Generate a new API key

### 2. Configure the Browser Extension

1. **Install the extension** (if not already done)
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `extension` folder

2. **Add your API key securely**
   - Click the AI Resume Screener extension icon in your toolbar
   - Enter your new OpenAI API key in the settings
   - Click "Save API Key"
   - The key is stored securely in Chrome's encrypted storage

### 3. Configure for GPT-4

The extension is already configured to use GPT-4. To ensure you're using the latest model:

1. Open `extension/content-ai-bridge.js`
2. Look for the model configuration (around line 300)
3. Verify it's set to: `model: 'gpt-4-turbo-preview'`

### 4. For the Web Application

If you want to use OpenAI in the web app (not just the extension):

1. **Use environment variables**
   ```bash
   # Create a .env.local file (never commit this!)
   VITE_OPENAI_API_KEY=your-new-api-key-here
   ```

2. **Access in your code**
   ```typescript
   // In your React components
   const apiKey = import.meta.env.VITE_OPENAI_API_KEY
   ```

## 🚀 Testing the Integration

1. **Test in Extension**
   - Go to a Keka candidate page
   - Select candidates
   - Click "AI Screen" button
   - Check if AI analysis works

2. **Verify GPT-4 Usage**
   - Check the browser console for API calls
   - Look for `model: 'gpt-4-turbo-preview'` in requests

## 📋 Best Practices

1. **Never hardcode API keys**
2. **Use environment variables for server-side code**
3. **Use secure browser storage for extensions**
4. **Rotate keys regularly**
5. **Set usage limits in OpenAI dashboard**
6. **Monitor your API usage**

## 🔧 Troubleshooting

If the AI screening isn't working:

1. **Check API key is saved**
   - Click extension icon
   - Verify "API Key Status: Configured ✓"

2. **Check browser console**
   - Right-click on page → Inspect
   - Look for any error messages

3. **Verify API key permissions**
   - Ensure your OpenAI account has GPT-4 access
   - Check API usage limits aren't exceeded

## 💡 Model Options

The extension supports multiple OpenAI models:

- `gpt-4-turbo-preview` - Best quality, higher cost
- `gpt-4` - High quality, standard GPT-4
- `gpt-3.5-turbo` - Good quality, lower cost

You can change the model in `extension/content-ai-bridge.js` based on your needs.