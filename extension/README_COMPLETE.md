# AI Resume Screener Browser Extension - Complete Guide

## 🎯 Overview

This browser extension bridges the gap between Keka ATS and an autonomous AI screening agent. It enables bulk candidate screening directly from Keka job pages using intake documents for job-specific analysis.

## 🚀 Key Features

### 1. **Autonomous AI Screening**
- Detects bulk-selected candidates on Keka pages
- Extracts candidate data from DOM (name, email, skills, experience)
- Sends to AI agent for autonomous decision-making
- Returns structured results with scores, tags, and recommendations

### 2. **Intake Document Management**
- Upload job descriptions/requirements as intake documents
- Store multiple documents for different positions
- Activate specific documents for targeted screening
- AI uses intake docs for job-specific candidate matching

### 3. **DOM Integration**
- Automatically detects Keka page types (job, candidates, dashboard)
- Extracts job context from page content
- Monitors checkbox selections for bulk operations
- Updates candidate rows with AI scores and decisions

### 4. **Bulk Processing**
- Select multiple candidates with checkboxes
- One-click screening of all selected candidates
- Progress tracking with ETA
- Batch results with export functionality

## 📁 File Structure

```
extension/
├── manifest.json          # Extension configuration
├── content-ai-bridge.js   # Main DOM integration & AI bridge
├── popup.html            # Extension popup UI
├── popup.js              # Popup controller
├── background.js         # Service worker
├── styles.css            # Extension styles
└── icons/                # Extension icons
```

## 🔧 How It Works

### 1. **Candidate Extraction Flow**
```javascript
Keka Page → DOM Scraping → Candidate Objects → AI Agent → Results Display
```

### 2. **Data Transformation**
- **DOM Elements** → `extractCandidateFromElement()`
- **Raw Data** → `Resume` objects with structured fields
- **Job Context** → Extracted from page headers/descriptions

### 3. **AI Integration**
```javascript
// Candidates are converted to Resume format
const resumes = selectedCandidates.map(candidate => ({
  id: candidate.id,
  name: candidate.name,
  email: candidate.email,
  skills: candidate.skills,
  experience: candidate.experience,
  education: candidate.education,
  // ... other fields
}));

// AI Agent processes with job context
const results = await aiAgent.autonomousScreening(
  resumes,
  jobRequirement,
  intakeDocument?.content
);
```

### 4. **Intake Document Usage**
- Stored in Chrome local storage
- Selected via dropdown in screening panel
- Passed to AI for context-aware analysis
- Enables job-specific scoring and recommendations

## 🎮 User Workflow

1. **Navigate to Keka Job Page**
   - Extension auto-detects page type
   - Extracts job title, department, requirements

2. **Select Candidates**
   - Use checkboxes to select multiple candidates
   - Counter shows selection count in FAB

3. **Choose Intake Document** (Optional)
   - Select from uploaded job descriptions
   - Or use general screening without intake doc

4. **Start Screening**
   - Click "🚀 Screen X Candidates" button
   - AI processes each candidate autonomously
   - Progress modal shows real-time updates

5. **Review Results**
   - Tabbed interface: Interview, Review, Reject
   - Each candidate shows scores, tags, reasoning
   - Export to CSV or update Keka directly

## 🔌 API Integration

### Content Script → AI Agent Communication
```javascript
// Message passing between content script and AI service
chrome.runtime.sendMessage({
  action: 'startScreening',
  candidates: selectedCandidates,
  jobContext: currentJobContext,
  intakeDocument: selectedIntakeDoc
});
```

### AI Agent Response Format
```javascript
{
  candidateId: "candidate_123",
  overallScore: 85,
  jobMatchScore: 92,
  decision: "interview", // or "review", "reject"
  confidence: 88,
  reasoning: ["Strong technical match", "Relevant experience"],
  nextSteps: ["Schedule technical interview", "Check references"],
  tags: ["Senior", "Remote Ready"],
  culturalFit: 80,
  growthPotential: 75
}
```

## 🛠️ Configuration

### API Key Setup
1. Click extension icon
2. Go to Settings or click "Setup API"
3. Enter OpenAI API key
4. Key is stored securely in Chrome sync storage

### Intake Documents
1. Click "Upload Intake Document"
2. Enter job title and department
3. Upload file or paste requirements
4. Document is stored locally for reuse

## 🐛 Troubleshooting

### Extension Not Working
1. Check if on Keka domain
2. Verify API key is configured
3. Reload the page
4. Check console for errors

### No Candidates Detected
1. Ensure candidates are visible on page
2. Check if using correct selectors
3. Try different Keka page layouts

### AI Screening Fails
1. Verify API key is valid
2. Check intake document format
3. Ensure candidates have sufficient data

## 🔒 Security

- API keys stored in Chrome sync storage
- No data sent to external servers (except OpenAI)
- Intake documents stored locally
- All processing happens client-side

## 🚀 Future Enhancements

1. **Real AI Agent Integration**
   - Replace mock screening with actual backend API
   - Connect to AIResumeAgent service

2. **Enhanced DOM Parsing**
   - Support more Keka page layouts
   - Extract resume content from links

3. **Advanced Features**
   - Batch operations across multiple jobs
   - Historical screening data
   - Learning from hiring outcomes

## 📝 Development Notes

### Adding New Selectors
Update `extractCandidateFromElement()` with new selectors:
```javascript
const selectors = {
  name: ['.candidate-name', '.name', 'td:nth-child(2)'],
  email: ['.email', '[href^="mailto:"]'],
  // Add more selectors as needed
};
```

### Modifying AI Prompts
Edit the screening logic in `simulateAutonomousScreening()` or connect to real AI service.

### Testing
1. Load extension in Chrome developer mode
2. Navigate to Keka or use test.html
3. Select candidates and test screening
4. Check console for debug logs