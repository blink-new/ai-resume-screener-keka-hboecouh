# 🤖 AI Resume Screener Browser Extension for Keka

A powerful Chrome/Firefox extension that brings AI-powered resume screening directly into your Keka ATS interface. Screen candidates instantly with GPT-4 analysis, automatic tagging, and intelligent scoring.

## ✨ Features

### 🎯 **One-Click AI Screening**
- **Instant Analysis**: Screen any candidate profile with a single click
- **Smart Detection**: Automatically detects candidate pages in Keka
- **Real-time Results**: Get AI analysis in seconds, not minutes

### 🏷️ **Intelligent Tagging**
- **Auto-Generated Tags**: AI creates relevant tags like "Senior Developer", "Remote Ready"
- **Skill Extraction**: Automatically identifies technical and soft skills
- **Experience Level**: Categorizes candidates as Entry/Mid/Senior/Expert

### 📊 **Comprehensive Scoring**
- **0-100 Score**: Objective candidate assessment
- **Strengths & Improvements**: Detailed feedback on candidate profile
- **Role Recommendations**: Suggests best-fit positions

### 🚀 **Seamless Integration**
- **Native Keka UI**: Buttons and widgets blend perfectly with Keka interface
- **Floating Widget**: Quick access AI screening from any Keka page
- **Context Menus**: Right-click to screen candidates
- **Bulk Processing**: Screen multiple candidates simultaneously

### ⚙️ **Smart Configuration**
- **Auto-Screen**: Automatically screen candidates when pages load
- **Custom Settings**: Configure behavior per your workflow
- **API Key Management**: Secure local storage of OpenAI credentials

## 🚀 Installation

### **Chrome Web Store** (Recommended)
1. Visit [Chrome Web Store - AI Resume Screener](https://chrome.google.com/webstore)
2. Click "Add to Chrome"
3. Configure your OpenAI API key
4. Navigate to Keka and start screening!

### **Manual Installation** (Developer Mode)
1. Download the extension files
2. Open Chrome → Extensions → Enable "Developer mode"
3. Click "Load unpacked" → Select extension folder
4. Pin the extension to your toolbar

### **Firefox Add-ons**
1. Visit [Firefox Add-ons - AI Resume Screener](https://addons.mozilla.org)
2. Click "Add to Firefox"
3. Follow setup instructions

## 🔧 Setup & Configuration

### **1. Get OpenAI API Key**
1. Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new secret key
3. Copy the key (starts with `sk-...`)

### **2. Configure Extension**
1. Click the extension icon in your browser
2. Click "Setup" if API key is missing
3. Paste your OpenAI API key
4. Adjust settings as needed:
   - ✅ **Auto-screen on page load**
   - ✅ **Show AI widget**
   - ✅ **Auto-add tags**

### **3. Start Screening**
1. Navigate to any Keka candidate profile
2. Look for the blue "🤖 AI Screen Resume" button
3. Click to analyze the candidate instantly
4. View results in the popup modal

## 🎮 How to Use

### **Screen Individual Candidates**
1. **Navigate** to a candidate profile in Keka
2. **Click** the "🤖 AI Screen Resume" button
3. **Wait** 3-5 seconds for AI analysis
4. **Review** the comprehensive results:
   - Overall score (0-100)
   - Key skills identified
   - Experience level assessment
   - Relevant tags for filtering
   - Strengths and improvement areas
   - Recommended roles

### **Bulk Screen Multiple Candidates**
1. **Go** to candidate list or job applicants page
2. **Right-click** → "📊 Bulk Screen All Candidates"
3. **Monitor** progress in the floating widget
4. **Export** results to your main dashboard

### **Use the Floating Widget**
- **Click** the 🤖 icon (bottom-right corner)
- **Quick Actions**: Screen current candidate, bulk screen, open dashboard
- **View Stats**: See daily screening count and average scores

### **Context Menu Options**
- **Right-click** on any Keka page for quick actions:
  - 🤖 AI Screen This Candidate
  - 📊 Bulk Screen All Candidates
  - 📈 Open AI Dashboard

## 🔍 What Gets Analyzed

The AI analyzes all visible candidate information:

### **📄 Resume Content**
- Work experience and job history
- Education and certifications
- Technical and soft skills
- Projects and achievements

### **📋 Profile Information**
- Contact details and location
- Summary/bio sections
- Any uploaded documents
- Skills listed in Keka profile

### **🎯 Job Matching** (Optional)
- Compare against specific job requirements
- Assess role fit and compatibility
- Identify skill gaps and strengths

## 📊 AI Analysis Output

### **🏆 Overall Score (0-100)**
- Comprehensive assessment based on:
  - Skill relevance and depth
  - Experience quality and progression
  - Education and certifications
  - Communication and presentation

### **🏷️ Smart Tags**
Auto-generated tags for easy filtering:
- **Technical**: "Full Stack", "DevOps", "Mobile Dev"
- **Experience**: "Senior Level", "Team Lead", "Startup Experience"
- **Soft Skills**: "Remote Ready", "Strong Communicator"
- **Industry**: "Fintech", "Healthcare", "E-commerce"

### **💡 Key Skills**
Extracted and categorized skills:
- Programming languages
- Frameworks and tools
- Soft skills and competencies
- Industry-specific knowledge

### **📈 Detailed Insights**
- **Experience Level**: Entry/Mid/Senior/Expert classification
- **Strengths**: Top 3 candidate advantages
- **Improvements**: Areas for development
- **Role Fit**: Recommended positions

## 🔒 Privacy & Security

### **🛡️ Data Protection**
- **Local Storage**: API keys stored locally in browser
- **No Data Collection**: Extension doesn't collect personal data
- **Secure Communication**: Direct API calls to OpenAI
- **No Third-Party Sharing**: Your data stays private

### **🔐 API Key Security**
- Keys stored in Chrome's secure storage
- Never transmitted to our servers
- Encrypted at rest in browser
- Easy to update or remove

## ⚡ Performance

### **🚀 Speed**
- **3-5 seconds** per candidate analysis
- **Parallel processing** for bulk screening
- **Cached results** to avoid re-analysis
- **Optimized API calls** for cost efficiency

### **💰 Cost Efficiency**
- **Smart prompting** minimizes token usage
- **Batch processing** reduces API calls
- **Result caching** prevents duplicate analysis
- **Estimated cost**: $0.01-0.05 per candidate

## 🛠️ Troubleshooting

### **Extension Not Working**
1. **Refresh** the Keka page
2. **Check** if you're on a supported Keka domain
3. **Verify** API key is configured correctly
4. **Disable** other extensions that might conflict

### **API Key Issues**
1. **Verify** key starts with `sk-`
2. **Check** OpenAI account has credits
3. **Ensure** API key has proper permissions
4. **Try** generating a new key

### **Screening Fails**
1. **Check** internet connection
2. **Verify** candidate page has resume content
3. **Try** refreshing and screening again
4. **Check** browser console for errors

### **No Candidates Detected**
1. **Ensure** you're on a Keka candidate profile page
2. **Check** URL contains `/candidate` or `/applicant`
3. **Try** manually clicking the AI button
4. **Verify** page is fully loaded

## 🔄 Updates & Changelog

### **Version 1.0.0** (Current)
- ✅ Initial release
- ✅ One-click candidate screening
- ✅ Auto-tagging and scoring
- ✅ Keka integration
- ✅ Floating widget
- ✅ Bulk screening
- ✅ Context menus

### **Coming Soon**
- 🔄 Multi-language support
- 📊 Advanced analytics dashboard
- 🎯 Custom scoring criteria
- 🔗 Integration with other ATS platforms
- 📱 Mobile browser support

## 🆘 Support

### **📧 Contact Support**
- **Email**: support@ai-resume-screener.com
- **Response Time**: 24-48 hours
- **Include**: Browser version, error messages, screenshots

### **🐛 Report Bugs**
1. **GitHub Issues**: [Report a bug](https://github.com/ai-resume-screener/issues)
2. **Include Details**: Browser, Keka version, steps to reproduce
3. **Screenshots**: Help us understand the issue

### **💡 Feature Requests**
- **GitHub Discussions**: [Request features](https://github.com/ai-resume-screener/discussions)
- **Email**: features@ai-resume-screener.com
- **Community**: Join our Discord for discussions

## 📜 License

MIT License - See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-4 API
- **Keka** for the amazing ATS platform
- **Chrome Extensions Team** for excellent documentation
- **Our Beta Users** for valuable feedback

---

**Made with ❤️ for HR professionals and recruiters worldwide**

*Transform your hiring process with AI-powered candidate screening!*