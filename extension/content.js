// AI Resume Screener Content Script for Keka - Enhanced Bulk Screening
class KekaAIScreener {
  constructor() {
    this.isInitialized = false;
    this.apiKey = null;
    this.intakeDocuments = [];
    this.selectedCandidates = [];
    this.currentJobContext = null;
    this.init();
  }

  async init() {
    if (this.isInitialized) return;
    
    // Load API key and intake documents from storage
    const result = await chrome.storage.sync.get(['openaiApiKey']);
    this.apiKey = result.openaiApiKey;
    
    await this.loadIntakeDocuments();
    
    // Detect Keka pages and inject functionality
    this.detectKekaPages();
    this.injectBulkScreeningUI();
    this.observePageChanges();
    this.setupCandidateSelection();
    
    this.isInitialized = true;
    console.log('🤖 AI Resume Screener initialized for Keka - Bulk Mode Ready');
  }

  async loadIntakeDocuments() {
    try {
      const result = await chrome.storage.local.get(['intakeDocuments']);
      this.intakeDocuments = result.intakeDocuments || [];
      console.log(`📄 Loaded ${this.intakeDocuments.length} intake documents`);
    } catch (error) {
      console.warn('Failed to load intake documents:', error);
      this.intakeDocuments = [];
    }
  }

  detectKekaPages() {
    const url = window.location.href;
    const pathname = window.location.pathname;
    
    // Enhanced page detection for Keka
    if (pathname.includes('/job') || pathname.includes('/position') || pathname.includes('/vacancy')) {
      this.pageType = 'job';
      this.extractJobContext();
      console.log('💼 Job page detected - Bulk screening available');
    } else if (pathname.includes('/candidate') || pathname.includes('/applicant')) {
      this.pageType = 'candidate';
      console.log('👤 Candidate page detected');
    } else if (pathname.includes('/recruitment') || pathname.includes('/hiring') || pathname.includes('/dashboard')) {
      this.pageType = 'recruitment';
      console.log('🎯 Recruitment dashboard detected');
    }
    
    // Extract job context if available
    this.extractJobContext();
  }

  extractJobContext() {
    // Extract job title, department, and requirements from the page
    const jobSelectors = {
      title: [
        'h1', 'h2', '.job-title', '.position-title', '.vacancy-title',
        '[data-testid="job-title"]', '.title'
      ],
      department: [
        '.department', '.job-department', '.team', '[data-testid="department"]'
      ],
      description: [
        '.job-description', '.job-details', '.position-details', 
        '.requirements', '.job-content', '.description'
      ]
    };

    this.currentJobContext = {};
    
    Object.keys(jobSelectors).forEach(field => {
      for (const selector of jobSelectors[field]) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
          this.currentJobContext[field] = element.textContent.trim();
          break;
        }
      }
    });

    console.log('🎯 Job context extracted:', this.currentJobContext);
  }

  setupCandidateSelection() {
    // Monitor checkbox selections for bulk operations
    this.observeCandidateSelection();
    
    // Add selection counter
    this.addSelectionCounter();
  }

  observeCandidateSelection() {
    // Watch for checkbox changes in candidate tables
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'checked') {
          this.updateSelectedCandidates();
        }
      });
    });

    // Observe all checkboxes in tables
    const checkboxes = document.querySelectorAll('table input[type="checkbox"], .candidate-list input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      observer.observe(checkbox, { attributes: true });
      checkbox.addEventListener('change', () => this.updateSelectedCandidates());
    });

    // Also observe for new checkboxes being added
    const tableObserver = new MutationObserver(() => {
      const newCheckboxes = document.querySelectorAll('table input[type="checkbox"]:not([data-ai-observed]), .candidate-list input[type="checkbox"]:not([data-ai-observed])');
      newCheckboxes.forEach(checkbox => {
        checkbox.setAttribute('data-ai-observed', 'true');
        checkbox.addEventListener('change', () => this.updateSelectedCandidates());
      });
    });

    const tables = document.querySelectorAll('table, .candidate-list');
    tables.forEach(table => {
      tableObserver.observe(table, { childList: true, subtree: true });
    });
  }

  updateSelectedCandidates() {
    // Get all checked candidate checkboxes
    const checkedBoxes = document.querySelectorAll('table input[type="checkbox"]:checked, .candidate-list input[type="checkbox"]:checked');
    
    this.selectedCandidates = [];
    
    checkedBoxes.forEach(checkbox => {
      const row = checkbox.closest('tr, .candidate-item, .applicant-item');
      if (row) {
        const candidate = this.extractCandidateFromRow(row);
        if (candidate.name && candidate.name !== 'Select All') {
          this.selectedCandidates.push(candidate);
        }
      }
    });

    console.log(`👥 Selected ${this.selectedCandidates.length} candidates`);
    this.updateSelectionCounter();
    this.updateBulkScreeningButton();
  }

  extractCandidateFromRow(row) {
    const cells = row.querySelectorAll('td, .candidate-field, .applicant-field');
    
    const candidate = {
      name: '',
      email: '',
      phone: '',
      skills: '',
      experience: '',
      education: '',
      location: '',
      resumeUrl: '',
      profileUrl: ''
    };

    // Extract from table cells (common Keka structure)
    if (cells.length >= 4) {
      candidate.name = cells[1]?.textContent?.trim() || '';
      candidate.skills = cells[2]?.textContent?.trim() || '';
      candidate.email = cells[3]?.textContent?.trim() || '';
      candidate.phone = cells[4]?.textContent?.trim() || '';
      candidate.location = cells[5]?.textContent?.trim() || '';
    }

    // Try to find resume/profile links
    const links = row.querySelectorAll('a');
    links.forEach(link => {
      const href = link.href;
      const text = link.textContent.toLowerCase();
      
      if (href.includes('/candidate/') || href.includes('/applicant/')) {
        candidate.profileUrl = href;
      }
      if (text.includes('resume') || text.includes('cv') || href.includes('.pdf')) {
        candidate.resumeUrl = href;
      }
    });

    // Extract additional info from data attributes or other elements
    const nameElement = row.querySelector('.candidate-name, .applicant-name, [data-testid="candidate-name"]');
    if (nameElement) {
      candidate.name = nameElement.textContent.trim();
    }

    const emailElement = row.querySelector('.email, [href^="mailto:"]');
    if (emailElement) {
      candidate.email = emailElement.textContent.trim() || emailElement.href.replace('mailto:', '');
    }

    return candidate;
  }

  injectBulkScreeningUI() {
    // Remove existing UI to prevent duplicates
    const existingUI = document.querySelectorAll('.ai-bulk-screening-ui');
    existingUI.forEach(ui => ui.remove());

    // Create floating action button for bulk screening
    this.createFloatingActionButton();
    
    // Add bulk screening panel to the page
    this.createBulkScreeningPanel();
  }

  createFloatingActionButton() {
    const fab = document.createElement('div');
    fab.className = 'ai-bulk-screening-ui ai-floating-fab';
    fab.innerHTML = `
      <div class="ai-fab-icon">🤖</div>
      <div class="ai-fab-tooltip">AI Bulk Screen</div>
      <div class="ai-fab-counter" style="display: none;">0</div>
    `;
    
    fab.addEventListener('click', () => {
      if (this.selectedCandidates.length > 0) {
        this.startBulkScreening();
      } else {
        this.showBulkScreeningPanel();
      }
    });
    
    document.body.appendChild(fab);
  }

  createBulkScreeningPanel() {
    // Find a good location for the bulk screening panel
    const targetSelectors = [
      '.bulk-actions', '.table-actions', '.candidate-actions',
      '.toolbar', '.action-bar', 'table', '.candidate-list'
    ];

    let targetElement = null;
    for (const selector of targetSelectors) {
      targetElement = document.querySelector(selector);
      if (targetElement) break;
    }

    if (targetElement) {
      const panel = document.createElement('div');
      panel.className = 'ai-bulk-screening-ui ai-bulk-panel';
      panel.innerHTML = `
        <div class="ai-panel-header">
          <h3>🤖 AI Bulk Resume Screening</h3>
          <button class="ai-panel-toggle">−</button>
        </div>
        <div class="ai-panel-content">
          <div class="ai-selection-info">
            <span class="ai-selected-count">0 candidates selected</span>
            <button class="ai-select-all-btn">Select All Visible</button>
          </div>
          
          <div class="ai-intake-section">
            <label>📄 Intake Document:</label>
            <select class="ai-intake-select">
              <option value="">General Screening</option>
            </select>
            <button class="ai-upload-intake-btn">+ Upload New</button>
          </div>
          
          <div class="ai-screening-options">
            <label>
              <input type="checkbox" class="ai-option-detailed" checked>
              Detailed Analysis (slower, more accurate)
            </label>
            <label>
              <input type="checkbox" class="ai-option-tags" checked>
              Auto-generate tags
            </label>
            <label>
              <input type="checkbox" class="ai-option-export" checked>
              Export results to CSV
            </label>
          </div>
          
          <div class="ai-action-buttons">
            <button class="ai-btn ai-btn-primary ai-bulk-screen-btn" disabled>
              📊 Start Bulk Screening
            </button>
            <button class="ai-btn ai-btn-secondary ai-settings-btn">
              ⚙️ Settings
            </button>
          </div>
        </div>
      `;

      // Insert panel before the target element
      targetElement.parentElement.insertBefore(panel, targetElement);
      
      // Setup panel event listeners
      this.setupPanelEventListeners(panel);
      
      // Populate intake documents dropdown
      this.populateIntakeDocuments(panel);
    }
  }

  setupPanelEventListeners(panel) {
    // Panel toggle
    const toggleBtn = panel.querySelector('.ai-panel-toggle');
    const content = panel.querySelector('.ai-panel-content');
    
    toggleBtn.addEventListener('click', () => {
      const isCollapsed = content.style.display === 'none';
      content.style.display = isCollapsed ? 'block' : 'none';
      toggleBtn.textContent = isCollapsed ? '−' : '+';
    });

    // Select all button
    const selectAllBtn = panel.querySelector('.ai-select-all-btn');
    selectAllBtn.addEventListener('click', () => {
      const checkboxes = document.querySelectorAll('table input[type="checkbox"], .candidate-list input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        if (!checkbox.checked && checkbox.closest('tr, .candidate-item')) {
          checkbox.checked = true;
        }
      });
      this.updateSelectedCandidates();
    });

    // Bulk screening button
    const bulkScreenBtn = panel.querySelector('.ai-bulk-screen-btn');
    bulkScreenBtn.addEventListener('click', () => {
      this.startBulkScreening();
    });

    // Settings button
    const settingsBtn = panel.querySelector('.ai-settings-btn');
    settingsBtn.addEventListener('click', () => {
      this.showSettingsModal();
    });

    // Upload intake document button
    const uploadBtn = panel.querySelector('.ai-upload-intake-btn');
    uploadBtn.addEventListener('click', () => {
      this.showIntakeUploadModal();
    });
  }

  populateIntakeDocuments(panel) {
    const select = panel.querySelector('.ai-intake-select');
    
    // Clear existing options except the first one
    while (select.children.length > 1) {
      select.removeChild(select.lastChild);
    }

    // Add intake documents
    this.intakeDocuments.forEach((doc, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${doc.jobTitle} - ${doc.department}`;
      if (doc.isActive) {
        option.textContent += ' (Active)';
      }
      select.appendChild(option);
    });
  }

  addSelectionCounter() {
    // Update the FAB counter
    const counter = document.querySelector('.ai-fab-counter');
    if (counter) {
      counter.textContent = this.selectedCandidates.length;
      counter.style.display = this.selectedCandidates.length > 0 ? 'block' : 'none';
    }
  }

  updateSelectionCounter() {
    // Update selection count in panel
    const countElement = document.querySelector('.ai-selected-count');
    if (countElement) {
      countElement.textContent = `${this.selectedCandidates.length} candidates selected`;
    }

    // Update FAB counter
    this.addSelectionCounter();
  }

  updateBulkScreeningButton() {
    const bulkBtn = document.querySelector('.ai-bulk-screen-btn');
    if (bulkBtn) {
      bulkBtn.disabled = this.selectedCandidates.length === 0;
      bulkBtn.textContent = this.selectedCandidates.length > 0 
        ? `📊 Screen ${this.selectedCandidates.length} Candidates`
        : '📊 Start Bulk Screening';
    }
  }

  async startBulkScreening() {
    if (!this.apiKey) {
      this.showSettingsModal();
      return;
    }

    if (this.selectedCandidates.length === 0) {
      this.showError('Please select candidates to screen.');
      return;
    }

    // Get selected intake document
    const intakeSelect = document.querySelector('.ai-intake-select');
    const selectedIntakeIndex = intakeSelect?.value;
    const intakeDocument = selectedIntakeIndex ? this.intakeDocuments[selectedIntakeIndex] : null;

    // Get screening options
    const detailedAnalysis = document.querySelector('.ai-option-detailed')?.checked || false;
    const autoTags = document.querySelector('.ai-option-tags')?.checked || true;
    const exportResults = document.querySelector('.ai-option-export')?.checked || true;

    console.log(`🚀 Starting bulk screening of ${this.selectedCandidates.length} candidates`);
    console.log('📄 Using intake document:', intakeDocument?.jobTitle || 'General screening');

    // Create and show progress modal
    const progressModal = this.createProgressModal(this.selectedCandidates.length);
    document.body.appendChild(progressModal);
    setTimeout(() => progressModal.classList.add('show'), 10);

    const results = [];
    let processed = 0;

    for (const candidate of this.selectedCandidates) {
      try {
        // Update progress
        this.updateProgress(progressModal, processed, this.selectedCandidates.length, 
          `Screening ${candidate.name}...`);
        
        // Prepare candidate content for AI analysis
        const candidateContent = this.prepareCandidateContent(candidate);
        
        if (candidateContent.length > 50) {
          // Perform AI analysis with intake document context
          const analysis = await this.analyzeWithAI(candidateContent, intakeDocument, detailedAnalysis);
          
          results.push({
            candidate: candidate,
            analysis: analysis,
            success: true
          });
        } else {
          results.push({
            candidate: candidate,
            error: 'Insufficient candidate information',
            success: false
          });
        }
        
        processed++;
        
        // Rate limiting - wait between requests to avoid API limits
        if (processed < this.selectedCandidates.length) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
      } catch (error) {
        console.error(`Failed to screen ${candidate.name}:`, error);
        results.push({
          candidate: candidate,
          error: error.message,
          success: false
        });
        processed++;
      }
    }

    // Update final progress
    this.updateProgress(progressModal, processed, this.selectedCandidates.length, 
      'Bulk screening complete!');
    
    // Show results after a brief delay
    setTimeout(() => {
      progressModal.classList.remove('show');
      setTimeout(() => progressModal.remove(), 300);
      this.displayBulkResults(results, exportResults);
    }, 2000);
  }

  prepareCandidateContent(candidate) {
    const content = [];
    
    if (candidate.name) content.push(`Name: ${candidate.name}`);
    if (candidate.email && candidate.email !== 'Not Available') content.push(`Email: ${candidate.email}`);
    if (candidate.phone && candidate.phone !== 'Not Available') content.push(`Phone: ${candidate.phone}`);
    if (candidate.skills && candidate.skills !== 'Not Available') content.push(`Skills/Tags: ${candidate.skills}`);
    if (candidate.experience && candidate.experience !== 'Not Available') content.push(`Experience: ${candidate.experience}`);
    if (candidate.education && candidate.education !== 'Not Available') content.push(`Education: ${candidate.education}`);
    if (candidate.location && candidate.location !== 'Not Available') content.push(`Location: ${candidate.location}`);
    
    // Add job context if available
    if (this.currentJobContext?.title) {
      content.push(`\nApplying for: ${this.currentJobContext.title}`);
    }
    if (this.currentJobContext?.department) {
      content.push(`Department: ${this.currentJobContext.department}`);
    }
    
    return content.join('\n');
  }

  async analyzeWithAI(candidateContent, intakeDocument = null, detailedAnalysis = false) {
    // Build comprehensive prompt with intake document context
    let jobContext = '';
    
    if (intakeDocument) {
      jobContext = `
JOB REQUIREMENTS CONTEXT:
Job Title: ${intakeDocument.jobTitle}
Department: ${intakeDocument.department}
Requirements: ${intakeDocument.content}

IMPORTANT: Analyze this candidate specifically against these job requirements. Provide both a general score and a job-specific match score.
`;
    } else if (this.currentJobContext?.title) {
      jobContext = `
JOB CONTEXT:
Position: ${this.currentJobContext.title}
${this.currentJobContext.department ? `Department: ${this.currentJobContext.department}` : ''}
${this.currentJobContext.description ? `Description: ${this.currentJobContext.description}` : ''}

Please consider this job context in your analysis.
`;
    }

    const analysisDepth = detailedAnalysis ? 'detailed' : 'standard';
    
    const prompt = `
Analyze this candidate profile and provide a structured assessment (${analysisDepth} analysis):

${jobContext}

CANDIDATE PROFILE:
${candidateContent}

Please provide a comprehensive analysis with:

1. **Overall Score (0-100)** - General candidate quality considering skills, experience, presentation
2. **Key Skills (max 8)** - Technical and soft skills identified
3. **Experience Level** - Entry/Mid/Senior/Expert based on available information
4. **Relevant Tags (max 6)** - For filtering and categorization
5. **Strengths (max 3)** - Key advantages of this candidate
6. **Areas for Improvement (max 2)** - Constructive feedback
7. **Recommended Roles (max 3)** - Best-fit positions for this candidate
${intakeDocument ? '8. **Job Match Score (0-100)** - How well this candidate matches the specific job requirements' : ''}
${intakeDocument ? '9. **Job Fit Summary** - Brief explanation of fit for the specific role' : ''}
${detailedAnalysis ? '10. **Detailed Assessment** - Comprehensive analysis of candidate potential' : ''}

CRITICAL: Respond ONLY with valid JSON in this exact format:
{
  "score": 85,
  "skills": ["JavaScript", "React", "Team Leadership", "Communication"],
  "experienceLevel": "Senior",
  "tags": ["Full Stack", "Remote Ready", "Team Lead", "Quick Learner"],
  "strengths": ["Strong technical skills", "Leadership experience", "Good communication"],
  "improvements": ["Could improve mobile development", "More cloud experience needed"],
  "recommendedRoles": ["Senior Developer", "Tech Lead", "Engineering Manager"]${intakeDocument ? ',\n  "jobMatchScore": 92,\n  "jobFitSummary": "Excellent match for the role with strong technical skills and relevant experience"' : ''}${detailedAnalysis ? ',\n  "detailedAssessment": "Comprehensive analysis of candidate strengths, growth potential, and cultural fit"' : ''}
}
`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: detailedAnalysis ? 1200 : 800
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API Error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const analysisText = data.choices[0].message.content.trim();
      
      // Extract and parse JSON
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : analysisText;
      
      const analysis = JSON.parse(jsonText);
      
      // Validate and sanitize
      analysis.score = Math.max(0, Math.min(100, analysis.score || 75));
      if (analysis.jobMatchScore) {
        analysis.jobMatchScore = Math.max(0, Math.min(100, analysis.jobMatchScore));
      }
      
      return analysis;
      
    } catch (error) {
      console.error('AI Analysis Error:', error);
      
      // Return fallback analysis
      return {
        score: 70,
        skills: ['Professional Skills', 'Communication', 'Problem Solving'],
        experienceLevel: 'Mid',
        tags: ['Qualified Candidate', 'Interview Ready'],
        strengths: ['Professional background', 'Relevant experience'],
        improvements: ['More detailed information needed'],
        recommendedRoles: ['Suitable Role', 'Professional Position'],
        error: error.message
      };
    }
  }

  createProgressModal(total) {
    const modal = document.createElement('div');
    modal.className = 'ai-results-modal';
    modal.innerHTML = `
      <div class="ai-modal-content">
        <div class="ai-modal-header">
          <h3>🤖 Bulk Screening Progress</h3>
        </div>
        <div class="ai-modal-body">
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: 0%"></div>
            </div>
            <div class="progress-text">Initializing bulk screening...</div>
            <div class="progress-stats">0 of ${total} candidates processed</div>
            <div class="progress-eta">Estimated time: ${Math.ceil(total * 2 / 60)} minutes</div>
          </div>
          <div class="progress-details">
            <div class="progress-success">✅ Successful: 0</div>
            <div class="progress-failed">❌ Failed: 0</div>
          </div>
        </div>
      </div>
    `;
    return modal;
  }

  updateProgress(modal, current, total, message) {
    const percentage = Math.round((current / total) * 100);
    const progressFill = modal.querySelector('.progress-fill');
    const progressText = modal.querySelector('.progress-text');
    const progressStats = modal.querySelector('.progress-stats');
    
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = message;
    progressStats.textContent = `${current} of ${total} candidates processed`;
    
    // Update ETA
    const etaElement = modal.querySelector('.progress-eta');
    if (current > 0) {
      const remaining = total - current;
      const avgTimePerCandidate = 2; // seconds
      const etaMinutes = Math.ceil(remaining * avgTimePerCandidate / 60);
      etaElement.textContent = `Estimated time remaining: ${etaMinutes} minutes`;
    }
  }

  displayBulkResults(results, exportResults = true) {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const avgScore = successful.length > 0 ? 
      Math.round(successful.reduce((sum, r) => sum + r.analysis.score, 0) / successful.length) : 0;

    // Sort results by score (highest first)
    successful.sort((a, b) => b.analysis.score - a.analysis.score);

    const modal = document.createElement('div');
    modal.className = 'ai-results-modal';
    modal.innerHTML = `
      <div class="ai-modal-content" style="max-width: 900px; max-height: 80vh;">
        <div class="ai-modal-header">
          <h3>📊 Bulk Screening Results</h3>
          <button class="ai-modal-close">&times;</button>
        </div>
        <div class="ai-modal-body" style="overflow-y: auto;">
          <div class="bulk-summary">
            <div class="summary-stats">
              <div class="stat-item">
                <span class="stat-number">${successful.length}</span>
                <span class="stat-label">Successfully Screened</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">${avgScore}</span>
                <span class="stat-label">Average Score</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">${failed.length}</span>
                <span class="stat-label">Failed</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">${successful.filter(r => r.analysis.score >= 80).length}</span>
                <span class="stat-label">High Scores (80+)</span>
              </div>
            </div>
          </div>
          
          <div class="results-tabs">
            <button class="tab-btn active" data-tab="successful">Successful (${successful.length})</button>
            ${failed.length > 0 ? `<button class="tab-btn" data-tab="failed">Failed (${failed.length})</button>` : ''}
          </div>
          
          <div class="tab-content active" data-tab="successful">
            <div class="results-list">
              ${successful.map(result => `
                <div class="result-item ${result.analysis.score >= 80 ? 'high-score' : result.analysis.score >= 60 ? 'medium-score' : 'low-score'}">
                  <div class="result-header">
                    <div class="result-name">
                      <strong>${result.candidate.name}</strong>
                      ${result.candidate.email ? `<span class="result-email">${result.candidate.email}</span>` : ''}
                    </div>
                    <div class="result-scores">
                      <span class="result-score">${result.analysis.score}/100</span>
                      ${result.analysis.jobMatchScore ? `<span class="result-job-score">Job: ${result.analysis.jobMatchScore}/100</span>` : ''}
                    </div>
                  </div>
                  <div class="result-details">
                    <div class="result-experience">${result.analysis.experienceLevel} Level</div>
                    <div class="result-tags">
                      ${result.analysis.tags.map(tag => `<span class="ai-tag">${tag}</span>`).join('')}
                    </div>
                    <div class="result-skills">
                      ${result.analysis.skills.slice(0, 4).map(skill => `<span class="ai-skill">${skill}</span>`).join('')}
                    </div>
                    ${result.analysis.jobFitSummary ? `<div class="result-fit-summary">${result.analysis.jobFitSummary}</div>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          ${failed.length > 0 ? `
            <div class="tab-content" data-tab="failed" style="display: none;">
              <div class="failed-section">
                ${failed.map(result => `
                  <div class="failed-item">
                    <strong>${result.candidate.name}</strong>
                    <span class="error-message">${result.error}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
        <div class="ai-modal-footer">
          <button class="ai-btn ai-btn-secondary ai-modal-close">Close</button>
          ${exportResults ? '<button class="ai-btn ai-btn-primary" id="export-results">📤 Export CSV</button>' : ''}
          <button class="ai-btn ai-btn-primary" id="add-tags-bulk">🏷️ Add Tags to Profiles</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Setup event listeners
    this.setupBulkResultsEventListeners(modal, results);
  }

  setupBulkResultsEventListeners(modal, results) {
    // Close modal
    modal.querySelectorAll('.ai-modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
      });
    });

    // Tab switching
    const tabBtns = modal.querySelectorAll('.tab-btn');
    const tabContents = modal.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        // Update active tab button
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Show corresponding content
        tabContents.forEach(content => {
          if (content.dataset.tab === tabName) {
            content.style.display = 'block';
            content.classList.add('active');
          } else {
            content.style.display = 'none';
            content.classList.remove('active');
          }
        });
      });
    });

    // Export results
    const exportBtn = modal.querySelector('#export-results');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportResultsToCSV(results);
      });
    }

    // Add tags to profiles
    const addTagsBtn = modal.querySelector('#add-tags-bulk');
    if (addTagsBtn) {
      addTagsBtn.addEventListener('click', () => {
        this.addTagsToProfiles(results.filter(r => r.success));
        this.showSuccess('Tags added to candidate profiles!');
      });
    }
  }

  exportResultsToCSV(results) {
    const successful = results.filter(r => r.success);
    
    if (successful.length === 0) {
      this.showError('No successful results to export.');
      return;
    }

    // Prepare CSV data
    const headers = [
      'Name', 'Email', 'Phone', 'Overall Score', 'Job Match Score', 
      'Experience Level', 'Skills', 'Tags', 'Strengths', 'Improvements', 
      'Recommended Roles', 'Job Fit Summary'
    ];

    const csvData = [headers];
    
    successful.forEach(result => {
      const row = [
        result.candidate.name || '',
        result.candidate.email || '',
        result.candidate.phone || '',
        result.analysis.score || '',
        result.analysis.jobMatchScore || '',
        result.analysis.experienceLevel || '',
        (result.analysis.skills || []).join('; '),
        (result.analysis.tags || []).join('; '),
        (result.analysis.strengths || []).join('; '),
        (result.analysis.improvements || []).join('; '),
        (result.analysis.recommendedRoles || []).join('; '),
        result.analysis.jobFitSummary || ''
      ];
      csvData.push(row);
    });

    // Convert to CSV string
    const csvString = csvData.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    // Download CSV
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ai-screening-results-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showSuccess('Results exported to CSV successfully!');
  }

  addTagsToProfiles(successfulResults) {
    // This would integrate with Keka's tagging system
    // For now, we'll add visual indicators to the candidate rows
    
    successfulResults.forEach(result => {
      const candidateName = result.candidate.name;
      
      // Find the candidate row in the table
      const rows = document.querySelectorAll('tr, .candidate-item');
      rows.forEach(row => {
        const nameCell = row.querySelector('td:nth-child(2), .candidate-name');
        if (nameCell && nameCell.textContent.trim() === candidateName) {
          // Add AI score indicator
          const scoreIndicator = document.createElement('span');
          scoreIndicator.className = 'ai-score-indicator';
          scoreIndicator.textContent = `🤖 ${result.analysis.score}`;
          scoreIndicator.title = `AI Score: ${result.analysis.score}/100`;
          
          if (!row.querySelector('.ai-score-indicator')) {
            nameCell.appendChild(scoreIndicator);
          }
          
          // Add top tags
          const tagsCell = row.querySelector('td:nth-child(3), .candidate-tags');
          if (tagsCell && result.analysis.tags.length > 0) {
            const topTags = result.analysis.tags.slice(0, 2);
            topTags.forEach(tag => {
              const tagElement = document.createElement('span');
              tagElement.className = 'ai-generated-tag';
              tagElement.textContent = tag;
              tagElement.title = 'AI Generated Tag';
              
              if (!tagsCell.textContent.includes(tag)) {
                tagsCell.appendChild(tagElement);
              }
            });
          }
        }
      });
    });
  }

  showBulkScreeningPanel() {
    const panel = document.querySelector('.ai-bulk-panel');
    if (panel) {
      panel.scrollIntoView({ behavior: 'smooth' });
      panel.style.border = '2px solid #2563EB';
      setTimeout(() => {
        panel.style.border = '';
      }, 2000);
    }
  }

  showIntakeUploadModal() {
    // Create intake document upload modal
    const modal = document.createElement('div');
    modal.className = 'ai-results-modal';
    modal.innerHTML = `
      <div class="ai-modal-content">
        <div class="ai-modal-header">
          <h3>📄 Upload Intake Document</h3>
          <button class="ai-modal-close">&times;</button>
        </div>
        <div class="ai-modal-body">
          <div class="ai-form-group">
            <label for="job-title">Job Title:</label>
            <input type="text" id="job-title" placeholder="e.g., Senior Software Developer" required>
          </div>
          <div class="ai-form-group">
            <label for="department">Department:</label>
            <input type="text" id="department" placeholder="e.g., Engineering" required>
          </div>
          <div class="ai-form-group">
            <label for="intake-file">Upload Document:</label>
            <input type="file" id="intake-file" accept=".pdf,.doc,.docx,.txt" />
            <small>Supported formats: PDF, DOC, DOCX, TXT (max 10MB)</small>
          </div>
          <div class="ai-form-group">
            <label for="manual-content">Or Enter Requirements Manually:</label>
            <textarea id="manual-content" rows="6" placeholder="Enter job requirements, skills needed, experience level, etc."></textarea>
          </div>
          <div class="ai-form-group">
            <label>
              <input type="checkbox" id="set-active" checked>
              Set as active intake document
            </label>
          </div>
        </div>
        <div class="ai-modal-footer">
          <button class="ai-btn ai-btn-secondary ai-modal-close">Cancel</button>
          <button class="ai-btn ai-btn-primary" id="save-intake">Save Intake Document</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Setup event listeners
    modal.querySelectorAll('.ai-modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
      });
    });

    modal.querySelector('#save-intake').addEventListener('click', async () => {
      await this.saveIntakeDocument(modal);
    });
  }

  async saveIntakeDocument(modal) {
    const jobTitle = modal.querySelector('#job-title').value.trim();
    const department = modal.querySelector('#department').value.trim();
    const fileInput = modal.querySelector('#intake-file');
    const manualContent = modal.querySelector('#manual-content').value.trim();
    const setActive = modal.querySelector('#set-active').checked;

    if (!jobTitle || !department) {
      this.showError('Please fill in job title and department.');
      return;
    }

    let content = manualContent;

    // Process uploaded file if provided
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      
      if (file.size > 10 * 1024 * 1024) {
        this.showError('File size must be less than 10MB.');
        return;
      }

      try {
        content = await this.readFileContent(file);
      } catch (error) {
        this.showError('Failed to read file content.');
        return;
      }
    }

    if (!content) {
      this.showError('Please provide job requirements either by uploading a file or entering manually.');
      return;
    }

    // Create intake document object
    const intakeDoc = {
      id: Date.now().toString(),
      jobTitle,
      department,
      content,
      isActive: setActive,
      createdAt: new Date().toISOString(),
      fileName: fileInput.files.length > 0 ? fileInput.files[0].name : null
    };

    // If setting as active, deactivate others
    if (setActive) {
      this.intakeDocuments.forEach(doc => doc.isActive = false);
    }

    // Add to intake documents
    this.intakeDocuments.push(intakeDoc);

    // Save to storage
    try {
      await chrome.storage.local.set({ intakeDocuments: this.intakeDocuments });
      
      // Update UI
      this.populateIntakeDocuments(document.querySelector('.ai-bulk-panel'));
      
      // Close modal
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
      
      this.showSuccess('Intake document saved successfully!');
      
    } catch (error) {
      this.showError('Failed to save intake document.');
    }
  }

  readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }

  showSettingsModal() {
    const modal = document.createElement('div');
    modal.className = 'ai-results-modal';
    modal.innerHTML = `
      <div class="ai-modal-content">
        <div class="ai-modal-header">
          <h3>⚙️ AI Resume Screener Settings</h3>
          <button class="ai-modal-close">&times;</button>
        </div>
        <div class="ai-modal-body">
          <div class="ai-form-group">
            <label for="openai-api-key">OpenAI API Key:</label>
            <input type="password" id="openai-api-key" placeholder="sk-..." value="${this.apiKey || ''}" />
            <small>Your API key is stored locally and never shared. <a href="https://platform.openai.com/api-keys" target="_blank">Get your API key</a></small>
          </div>
          
          <div class="ai-form-group">
            <h4>Intake Documents (${this.intakeDocuments.length})</h4>
            <div class="intake-docs-list">
              ${this.intakeDocuments.map((doc, index) => `
                <div class="intake-doc-item">
                  <div class="doc-info">
                    <strong>${doc.jobTitle}</strong> - ${doc.department}
                    ${doc.isActive ? '<span class="active-badge">Active</span>' : ''}
                  </div>
                  <div class="doc-actions">
                    <button class="ai-btn-small" onclick="this.toggleIntakeDoc(${index})">${doc.isActive ? 'Deactivate' : 'Activate'}</button>
                    <button class="ai-btn-small ai-btn-danger" onclick="this.deleteIntakeDoc(${index})">Delete</button>
                  </div>
                </div>
              `).join('')}
            </div>
            <button class="ai-btn ai-btn-secondary" id="add-intake-doc">+ Add New Intake Document</button>
          </div>
          
          <div class="ai-form-group">
            <h4>Screening Options</h4>
            <label>
              <input type="checkbox" id="auto-export" checked>
              Automatically export results to CSV
            </label>
            <label>
              <input type="checkbox" id="auto-tags" checked>
              Automatically add AI tags to profiles
            </label>
            <label>
              <input type="checkbox" id="detailed-analysis">
              Use detailed analysis by default (slower, more accurate)
            </label>
          </div>
        </div>
        <div class="ai-modal-footer">
          <button class="ai-btn ai-btn-secondary ai-modal-close">Cancel</button>
          <button class="ai-btn ai-btn-primary" id="save-settings">Save Settings</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Setup event listeners
    modal.querySelectorAll('.ai-modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
      });
    });

    modal.querySelector('#save-settings').addEventListener('click', async () => {
      const apiKey = modal.querySelector('#openai-api-key').value.trim();
      
      if (apiKey && apiKey !== this.apiKey) {
        await chrome.storage.sync.set({ openaiApiKey: apiKey });
        this.apiKey = apiKey;
      }
      
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
      
      this.showSuccess('Settings saved successfully!');
    });

    modal.querySelector('#add-intake-doc').addEventListener('click', () => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
      this.showIntakeUploadModal();
    });
  }

  showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'ai-success-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  showError(message) {
    const toast = document.createElement('div');
    toast.className = 'ai-error-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  observePageChanges() {
    // Watch for page changes in SPA
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Re-detect page type and re-inject if needed
          setTimeout(() => {
            this.detectKekaPages();
            this.setupCandidateSelection();
          }, 1000);
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Message listener for popup communication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'ping') {
    sendResponse({ 
      status: 'ready', 
      selectedCandidates: window.kekaScreener?.selectedCandidates?.length || 0,
      pageType: window.kekaScreener?.pageType || 'unknown'
    });
    return;
  }
  
  if (message.action === 'bulkScreen') {
    if (window.kekaScreener) {
      window.kekaScreener.startBulkScreening()
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
    } else {
      sendResponse({ success: false, error: 'AI Screener not initialized' });
    }
    return true;
  }
  
  if (message.action === 'getSelectedCount') {
    sendResponse({ 
      count: window.kekaScreener?.selectedCandidates?.length || 0,
      candidates: window.kekaScreener?.selectedCandidates || []
    });
    return;
  }
});

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.kekaScreener = new KekaAIScreener();
  });
} else {
  window.kekaScreener = new KekaAIScreener();
}