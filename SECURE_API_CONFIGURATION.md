# 🔐 Secure API Configuration Guide

## ⚠️ CRITICAL SECURITY NOTICE

**Your API key has been exposed in this conversation. You MUST:**

1. **Immediately revoke the exposed key** at [OpenAI API Keys](https://platform.openai.com/api-keys)
2. **Generate a new API key**
3. **Never share API keys in messages or code**

## ✅ How to Securely Configure Your AI Resume Screener

### Step 1: Generate a New API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Name it (e.g., "AI Resume Screener")
4. Copy the key (starts with `sk-proj-...`)
5. **Save it securely** - you won't see it again!

### Step 2: Configure the Browser Extension

1. **Click the AI Resume Screener extension icon** in your browser toolbar
2. **Enter your API key** in the settings field
3. **Click "Save API Key"**
4. The key is now stored securely in Chrome's encrypted storage

### Step 3: Verify GPT-4 Configuration

The extension is now configured to use **GPT-4 Turbo** for the best quality analysis:

```javascript
// Already configured in extension/content.js
model: 'gpt-4-turbo-preview'
```

### Step 4: Test the Integration

1. Go to your Keka ATS platform
2. Navigate to a job with candidates
3. Select some candidates using checkboxes
4. Click the "🤖 AI Bulk Screen" button
5. Watch as GPT-4 analyzes each candidate

## 🛡️ Security Best Practices

### DO:
- ✅ Store API keys in browser's secure storage
- ✅ Use environment variables for server-side apps
- ✅ Rotate keys regularly
- ✅ Set usage limits in OpenAI dashboard
- ✅ Monitor API usage for anomalies

### DON'T:
- ❌ Share API keys in messages or forums
- ❌ Commit API keys to Git repositories
- ❌ Hardcode keys in source code
- ❌ Use the same key across multiple projects
- ❌ Ignore usage alerts from OpenAI

## 💰 Cost Management

Using GPT-4 Turbo provides the best quality but costs more than GPT-3.5:

- **GPT-4 Turbo**: ~$0.01 per 1K input tokens, $0.03 per 1K output tokens
- **GPT-3.5 Turbo**: ~$0.0005 per 1K input tokens, $0.0015 per 1K output tokens

For bulk screening 100 candidates:
- GPT-4: ~$2-3
- GPT-3.5: ~$0.10-0.15

### To Switch Models (if needed):

Edit `extension/content.js` line 579:
```javascript
// For cost savings, you can use:
model: 'gpt-3.5-turbo'  // Cheaper, still good quality

// For best quality (current setting):
model: 'gpt-4-turbo-preview'  // Best results
```

## 🚀 Ready to Use!

Your AI Resume Screener is now:
- ✅ Configured with GPT-4 for superior analysis
- ✅ Secured with encrypted API key storage
- ✅ Ready for bulk candidate screening
- ✅ Integrated with Keka ATS

Remember: **Never share your API key publicly again!**