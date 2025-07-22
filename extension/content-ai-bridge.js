// AI Resume Screener - Keka DOM to AIResumeAgent Bridge
// This script connects the browser extension to the AI autonomous screening system

class KekaAIBridge {
  constructor() {
    this.isInitialized = false;
    this.apiKey = null;
    this.intakeDocuments = [];
    this.selectedCandidates = [];
    this.currentJobContext = null;
    this.aiAgent = null;
    this.init();
  }

  async init() {
    if (this.isInitialized) return;
    
    // Load configuration
    await this.loadConfiguration();
    
    // Initialize AI Agent connection
    this.initializeAIAgent();
    
    // Setup DOM integration
    this.setupDOMIntegration();
    
    this.isInitialized = true;
    console.log('🤖 Keka AI Bridge initialized - Ready for autonomous screening');
  }

  async loadConfiguration() {
    try {
      const result = await chrome.storage.sync.get(['openaiApiKey']);
      this.apiKey = result.openaiApiKey;
      
      const intakeResult = await chrome.storage.local.get(['intakeDocuments']);
      this.intakeDocuments = intakeResult.intakeDocuments || [];
      
      console.log(`✅ Configuration loaded - ${this.intakeDocuments.length} intake documents available`);
    } catch (error) {
      console.error('Failed to load configuration:', error);
    }
  }

  initializeAIAgent() {
    // Initialize connection to AI Resume Agent
    // In a real implementation, this would connect to your backend service
    this.aiAgent = {
      autonomousScreening: async (candidates, jobRequirement, intakeDocument) => {
        // This will be replaced with actual API call to your backend
        return this.simulateAutonomousScreening(candidates, jobRequirement, intakeDocument);
      }
    };
  }

  setupDOMIntegration() {
    // Detect page type and setup appropriate integration
    this.detectKekaPageType();
    
    // Setup candidate extraction from DOM
    this.setupCandidateExtraction();
    
    // Setup job context extraction
    this.extractJobContext();
    
    // Add AI screening button to UI
    this.injectAIScreeningUI();
    
    // Monitor for page changes
    this.observePageChanges();
  }

  detectKekaPageType() {
    const url = window.location.href;
    const pathname = window.location.pathname;
    
    // Enhanced detection for various Keka URL patterns
    const pagePatterns = {
      job: ['/job', '/position', '/vacancy', '/opening', '/requisition'],
      candidates: ['/candidates', '/applicants', '/applications', '/talent-pool'],
      dashboard: ['/dashboard', '/recruitment', '/hiring', '/ats']
    };
    
    for (const [type, patterns] of Object.entries(pagePatterns)) {
      if (patterns.some(pattern => pathname.includes(pattern))) {
        this.pageType = type;
        console.log(`📄 Detected ${type} page`);
        break;
      }
    }
  }

  setupCandidateExtraction() {
    // Setup observers for candidate selection
    this.observeCandidateSelection();
    
    // Add extraction methods for different Keka layouts
    this.candidateExtractors = {
      table: () => this.extractFromTable(),
      grid: () => this.extractFromGrid(),
      list: () => this.extractFromList()
    };
  }

  observeCandidateSelection() {
    // Create a mutation observer to watch for checkbox changes
    const observer = new MutationObserver(() => {
      this.updateSelectedCandidates();
    });

    // Observe the entire document for changes
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['checked'],
      subtree: true
    });

    // Also add click listeners to all checkboxes
    document.addEventListener('click', (e) => {
      if (e.target.type === 'checkbox') {
        setTimeout(() => this.updateSelectedCandidates(), 100);
      }
    });
  }

  updateSelectedCandidates() {
    const candidates = [];
    
    // Try different selectors for checkboxes
    const checkboxSelectors = [
      'input[type="checkbox"]:checked',
      '.candidate-checkbox:checked',
      '.select-candidate:checked',
      '[data-testid="candidate-select"]:checked'
    ];
    
    for (const selector of checkboxSelectors) {
      const checkboxes = document.querySelectorAll(selector);
      if (checkboxes.length > 0) {
        checkboxes.forEach(checkbox => {
          const candidate = this.extractCandidateFromElement(checkbox);
          if (candidate && candidate.name && !candidate.name.includes('Select All')) {
            candidates.push(candidate);
          }
        });
        break;
      }
    }
    
    this.selectedCandidates = candidates;
    console.log(`👥 ${candidates.length} candidates selected`);
    this.updateUICounter();
  }

  extractCandidateFromElement(checkbox) {
    // Find the parent row or container
    const container = checkbox.closest('tr, .candidate-item, .applicant-card, [data-candidate]');
    if (!container) return null;
    
    // Extract candidate data from DOM
    const candidate = {
      id: this.generateCandidateId(container),
      name: this.extractText(container, ['.candidate-name', '.name', 'td:nth-child(2)', '[data-field="name"]']),
      email: this.extractText(container, ['.email', '[href^="mailto:"]', 'td:nth-child(3)', '[data-field="email"]']),
      phone: this.extractText(container, ['.phone', '.contact', 'td:nth-child(4)', '[data-field="phone"]']),
      skills: this.extractSkills(container),
      experience: this.extractExperience(container),
      education: this.extractEducation(container),
      location: this.extractText(container, ['.location', '.city', '[data-field="location"]']),
      resumeUrl: this.extractResumeUrl(container),
      profileUrl: this.extractProfileUrl(container),
      appliedDate: this.extractText(container, ['.applied-date', '.date', '[data-field="applied"]']),
      status: this.extractText(container, ['.status', '.stage', '[data-field="status"]'])
    };
    
    // Clean email if extracted from mailto link
    if (candidate.email && candidate.email.startsWith('mailto:')) {
      candidate.email = candidate.email.replace('mailto:', '');
    }
    
    return candidate;
  }

  extractText(container, selectors) {
    for (const selector of selectors) {
      const element = container.querySelector(selector);
      if (element) {
        return element.textContent.trim();
      }
    }
    return '';
  }

  extractSkills(container) {
    const skillsText = this.extractText(container, [
      '.skills', '.tags', '[data-field="skills"]', 'td:nth-child(5)'
    ]);
    
    if (!skillsText) return [];
    
    // Parse skills from various formats
    return skillsText
      .split(/[,;|]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
  }

  extractExperience(container) {
    const expText = this.extractText(container, [
      '.experience', '.exp', '[data-field="experience"]', 'td:nth-child(6)'
    ]);
    
    // Try to extract years from text
    const yearMatch = expText.match(/(\d+)\s*(years?|yrs?)/i);
    if (yearMatch) {
      return parseInt(yearMatch[1]);
    }
    
    return expText || '0';
  }

  extractEducation(container) {
    return this.extractText(container, [
      '.education', '.degree', '[data-field="education"]', 'td:nth-child(7)'
    ]) || 'Not specified';
  }

  extractResumeUrl(container) {
    const resumeLink = container.querySelector('a[href*="resume"], a[href*=".pdf"], .resume-link');
    return resumeLink ? resumeLink.href : '';
  }

  extractProfileUrl(container) {
    const profileLink = container.querySelector('a[href*="/candidate/"], a[href*="/applicant/"], .profile-link');
    return profileLink ? profileLink.href : '';
  }

  generateCandidateId(container) {
    // Try to find an ID in data attributes or generate one
    return container.dataset.candidateId || 
           container.dataset.id || 
           `candidate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  extractJobContext() {
    const job = {
      id: '',
      title: '',
      department: '',
      requiredSkills: [],
      experienceLevel: '',
      description: ''
    };
    
    // Extract job title
    const titleSelectors = ['h1', 'h2', '.job-title', '.position-name', '[data-testid="job-title"]'];
    job.title = this.extractTextFromSelectors(titleSelectors);
    
    // Extract department
    const deptSelectors = ['.department', '.team', '.division', '[data-field="department"]'];
    job.department = this.extractTextFromSelectors(deptSelectors);
    
    // Extract job description
    const descSelectors = ['.job-description', '.job-details', '.requirements', '[data-field="description"]'];
    job.description = this.extractTextFromSelectors(descSelectors);
    
    // Extract required skills from description
    if (job.description) {
      const skillsMatch = job.description.match(/skills?:?\s*([^.]+)/i);
      if (skillsMatch) {
        job.requiredSkills = skillsMatch[1]
          .split(/[,;]/)
          .map(skill => skill.trim())
          .filter(skill => skill.length > 0);
      }
    }
    
    // Extract experience level
    const expMatch = job.description.match(/(\d+)\+?\s*years?/i);
    if (expMatch) {
      const years = parseInt(expMatch[1]);
      job.experienceLevel = years <= 2 ? 'Entry' : years <= 5 ? 'Mid' : 'Senior';
    }
    
    this.currentJobContext = job;
    console.log('💼 Job context extracted:', job);
    return job;
  }

  extractTextFromSelectors(selectors) {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }
    return '';
  }

  injectAIScreeningUI() {
    // Remove existing UI to prevent duplicates
    document.querySelectorAll('.keka-ai-bridge-ui').forEach(el => el.remove());
    
    // Create floating action button
    const fab = document.createElement('div');
    fab.className = 'keka-ai-bridge-ui ai-fab';
    fab.innerHTML = `
      <div class="ai-fab-content">
        <span class="ai-fab-icon">🤖</span>
        <span class="ai-fab-text">AI Screen</span>
        <span class="ai-fab-counter" style="display: none;">0</span>
      </div>
    `;
    
    fab.addEventListener('click', () => this.startAutonomousScreening());
    document.body.appendChild(fab);
    
    // Add control panel
    this.injectControlPanel();
  }

  injectControlPanel() {
    const panel = document.createElement('div');
    panel.className = 'keka-ai-bridge-ui ai-control-panel';
    panel.innerHTML = `
      <div class="ai-panel-header">
        <h3>🤖 AI Autonomous Screening</h3>
        <button class="ai-panel-close">×</button>
      </div>
      <div class="ai-panel-body">
        <div class="ai-status">
          <span class="ai-status-text">Ready</span>
          <span class="ai-selected-count">0 candidates selected</span>
        </div>
        
        <div class="ai-intake-section">
          <label>📄 Intake Document:</label>
          <select class="ai-intake-select">
            <option value="">Use job description</option>
            ${this.intakeDocuments.map((doc, idx) => 
              `<option value="${idx}">${doc.jobTitle} - ${doc.department}</option>`
            ).join('')}
          </select>
        </div>
        
        <div class="ai-actions">
          <button class="ai-btn ai-btn-primary ai-start-screening" disabled>
            🚀 Start Autonomous Screening
          </button>
          <button class="ai-btn ai-btn-secondary ai-select-all">
            Select All Visible
          </button>
        </div>
        
        <div class="ai-results-summary" style="display: none;">
          <h4>Screening Results</h4>
          <div class="ai-results-stats"></div>
        </div>
      </div>
    `;
    
    // Find a good place to inject the panel
    const targetElement = document.querySelector('.bulk-actions, .toolbar, .page-header, main');
    if (targetElement) {
      targetElement.insertAdjacentElement('afterbegin', panel);
    } else {
      document.body.appendChild(panel);
    }
    
    // Setup event listeners
    this.setupPanelEventListeners(panel);
  }

  setupPanelEventListeners(panel) {
    // Close button
    panel.querySelector('.ai-panel-close').addEventListener('click', () => {
      panel.style.display = 'none';
    });
    
    // Select all button
    panel.querySelector('.ai-select-all').addEventListener('click', () => {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]:not(:checked)');
      checkboxes.forEach(cb => {
        if (!cb.closest('th')) { // Skip header checkboxes
          cb.click();
        }
      });
    });
    
    // Start screening button
    panel.querySelector('.ai-start-screening').addEventListener('click', () => {
      this.startAutonomousScreening();
    });
  }

  updateUICounter() {
    // Update FAB counter
    const counter = document.querySelector('.ai-fab-counter');
    if (counter) {
      counter.textContent = this.selectedCandidates.length;
      counter.style.display = this.selectedCandidates.length > 0 ? 'inline' : 'none';
    }
    
    // Update panel counter
    const panelCount = document.querySelector('.ai-selected-count');
    if (panelCount) {
      panelCount.textContent = `${this.selectedCandidates.length} candidates selected`;
    }
    
    // Enable/disable start button
    const startBtn = document.querySelector('.ai-start-screening');
    if (startBtn) {
      startBtn.disabled = this.selectedCandidates.length === 0;
      startBtn.textContent = this.selectedCandidates.length > 0 
        ? `🚀 Screen ${this.selectedCandidates.length} Candidates`
        : '🚀 Start Autonomous Screening';
    }
  }

  async startAutonomousScreening() {
    if (this.selectedCandidates.length === 0) {
      this.showNotification('Please select candidates to screen', 'error');
      return;
    }
    
    if (!this.apiKey) {
      this.showNotification('Please configure your API key in the extension settings', 'error');
      chrome.runtime.sendMessage({ action: 'openSettings' });
      return;
    }
    
    // Get selected intake document
    const intakeSelect = document.querySelector('.ai-intake-select');
    const selectedIntakeIdx = intakeSelect ? intakeSelect.value : '';
    const intakeDocument = selectedIntakeIdx !== '' ? this.intakeDocuments[selectedIntakeIdx] : null;
    
    // Convert DOM candidates to Resume format
    const resumes = this.selectedCandidates.map(candidate => ({
      id: candidate.id,
      name: candidate.name || 'Unknown',
      email: candidate.email || '',
      phone: candidate.phone || '',
      skills: candidate.skills || [],
      experience: typeof candidate.experience === 'number' ? candidate.experience : parseInt(candidate.experience) || 0,
      education: candidate.education || '',
      tags: [],
      status: 'processing',
      userId: 'keka-user',
      location: candidate.location || '',
      resumeUrl: candidate.resumeUrl || ''
    }));
    
    // Prepare job requirement
    const jobRequirement = {
      id: this.currentJobContext?.id || 'job_' + Date.now(),
      title: this.currentJobContext?.title || 'General Position',
      department: this.currentJobContext?.department || 'General',
      requiredSkills: this.currentJobContext?.requiredSkills || [],
      experienceLevel: this.currentJobContext?.experienceLevel || 'Any',
      description: this.currentJobContext?.description || ''
    };
    
    console.log('🚀 Starting autonomous screening:', {
      candidates: resumes.length,
      job: jobRequirement.title,
      intakeDoc: intakeDocument?.jobTitle || 'None'
    });
    
    // Show progress modal
    this.showProgressModal(resumes.length);
    
    try {
      // Call AI Agent for autonomous screening
      const results = await this.aiAgent.autonomousScreening(
        resumes,
        jobRequirement,
        intakeDocument?.content
      );
      
      // Display results
      this.displayScreeningResults(results, resumes);
      
      // Update candidate rows with results
      this.updateCandidateRowsWithResults(results);
      
    } catch (error) {
      console.error('Screening error:', error);
      this.showNotification('Screening failed: ' + error.message, 'error');
    } finally {
      this.hideProgressModal();
    }
  }

  async simulateAutonomousScreening(candidates, jobRequirement, intakeDocument) {
    // This simulates the AI agent screening process
    // In production, this would be an API call to your backend
    
    const results = [];
    
    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      
      // Update progress
      this.updateProgress(i + 1, candidates.length, `Screening ${candidate.name}...`);
      
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock result (in production, this would be real AI analysis)
      const result = {
        candidateId: candidate.id,
        overallScore: Math.floor(Math.random() * 30) + 70,
        jobMatchScore: Math.floor(Math.random() * 30) + 70,
        decision: Math.random() > 0.7 ? 'interview' : Math.random() > 0.5 ? 'review' : 'reject',
        confidence: Math.floor(Math.random() * 20) + 80,
        reasoning: [
          'Strong technical skills match',
          'Relevant experience in similar role',
          'Good cultural fit indicators'
        ],
        nextSteps: [
          'Schedule technical interview',
          'Review portfolio',
          'Check references'
        ],
        tags: ['Senior', 'Remote Ready', 'Strong Match'],
        biasFlags: [],
        culturalFit: Math.floor(Math.random() * 20) + 75,
        growthPotential: Math.floor(Math.random() * 20) + 70,
        processedAt: new Date().toISOString()
      };
      
      results.push(result);
    }
    
    return results;
  }

  showProgressModal(total) {
    const modal = document.createElement('div');
    modal.className = 'keka-ai-bridge-ui ai-progress-modal';
    modal.innerHTML = `
      <div class="ai-modal-content">
        <h3>🤖 Autonomous AI Screening in Progress</h3>
        <div class="ai-progress-bar">
          <div class="ai-progress-fill" style="width: 0%"></div>
        </div>
        <div class="ai-progress-text">Initializing AI agent...</div>
        <div class="ai-progress-stats">0 / ${total} candidates processed</div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  updateProgress(current, total, message) {
    const progressFill = document.querySelector('.ai-progress-fill');
    const progressText = document.querySelector('.ai-progress-text');
    const progressStats = document.querySelector('.ai-progress-stats');
    
    if (progressFill) {
      const percentage = (current / total) * 100;
      progressFill.style.width = percentage + '%';
    }
    
    if (progressText) {
      progressText.textContent = message;
    }
    
    if (progressStats) {
      progressStats.textContent = `${current} / ${total} candidates processed`;
    }
  }

  hideProgressModal() {
    const modal = document.querySelector('.ai-progress-modal');
    if (modal) {
      modal.remove();
    }
  }

  displayScreeningResults(results, candidates) {
    const modal = document.createElement('div');
    modal.className = 'keka-ai-bridge-ui ai-results-modal';
    
    // Group results by decision
    const grouped = {
      interview: results.filter(r => r.decision === 'interview'),
      review: results.filter(r => r.decision === 'review'),
      reject: results.filter(r => r.decision === 'reject')
    };
    
    modal.innerHTML = `
      <div class="ai-modal-content ai-modal-large">
        <div class="ai-modal-header">
          <h3>📊 AI Screening Results</h3>
          <button class="ai-modal-close">×</button>
        </div>
        <div class="ai-modal-body">
          <div class="ai-results-summary">
            <div class="ai-stat">
              <span class="ai-stat-number">${grouped.interview.length}</span>
              <span class="ai-stat-label">Ready for Interview</span>
            </div>
            <div class="ai-stat">
              <span class="ai-stat-number">${grouped.review.length}</span>
              <span class="ai-stat-label">Need Review</span>
            </div>
            <div class="ai-stat">
              <span class="ai-stat-number">${grouped.reject.length}</span>
              <span class="ai-stat-label">Not Suitable</span>
            </div>
          </div>
          
          <div class="ai-results-tabs">
            <button class="ai-tab active" data-tab="interview">Interview (${grouped.interview.length})</button>
            <button class="ai-tab" data-tab="review">Review (${grouped.review.length})</button>
            <button class="ai-tab" data-tab="reject">Rejected (${grouped.reject.length})</button>
          </div>
          
          <div class="ai-results-content">
            ${Object.entries(grouped).map(([decision, results]) => `
              <div class="ai-tab-content ${decision === 'interview' ? 'active' : ''}" data-tab="${decision}">
                ${results.map(result => {
                  const candidate = candidates.find(c => c.id === result.candidateId);
                  return `
                    <div class="ai-result-card">
                      <div class="ai-result-header">
                        <h4>${candidate?.name || 'Unknown'}</h4>
                        <div class="ai-scores">
                          <span class="ai-score">Overall: ${result.overallScore}/100</span>
                          <span class="ai-score">Job Match: ${result.jobMatchScore}/100</span>
                        </div>
                      </div>
                      <div class="ai-result-body">
                        <div class="ai-tags">
                          ${result.tags.map(tag => `<span class="ai-tag">${tag}</span>`).join('')}
                        </div>
                        <div class="ai-reasoning">
                          <strong>AI Analysis:</strong>
                          <ul>
                            ${result.reasoning.map(reason => `<li>${reason}</li>`).join('')}
                          </ul>
                        </div>
                        <div class="ai-next-steps">
                          <strong>Recommended Actions:</strong>
                          <ul>
                            ${result.nextSteps.map(step => `<li>${step}</li>`).join('')}
                          </ul>
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `).join('')}
          </div>
        </div>
        <div class="ai-modal-footer">
          <button class="ai-btn ai-btn-secondary ai-modal-close">Close</button>
          <button class="ai-btn ai-btn-primary ai-export-results">Export Results</button>
          <button class="ai-btn ai-btn-primary ai-update-keka">Update in Keka</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup event listeners
    this.setupResultsModalListeners(modal, results);
  }

  setupResultsModalListeners(modal, results) {
    // Close button
    modal.querySelectorAll('.ai-modal-close').forEach(btn => {
      btn.addEventListener('click', () => modal.remove());
    });
    
    // Tab switching
    modal.querySelectorAll('.ai-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        // Update active tab
        modal.querySelectorAll('.ai-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show corresponding content
        const tabName = tab.dataset.tab;
        modal.querySelectorAll('.ai-tab-content').forEach(content => {
          content.classList.toggle('active', content.dataset.tab === tabName);
        });
      });
    });
    
    // Export results
    modal.querySelector('.ai-export-results').addEventListener('click', () => {
      this.exportResults(results);
    });
    
    // Update in Keka
    modal.querySelector('.ai-update-keka').addEventListener('click', () => {
      this.updateKekaWithResults(results);
      modal.remove();
    });
  }

  updateCandidateRowsWithResults(results) {
    results.forEach(result => {
      const candidate = this.selectedCandidates.find(c => c.id === result.candidateId);
      if (!candidate) return;
      
      // Find the candidate's row in the DOM
      const rows = document.querySelectorAll('tr, .candidate-item');
      rows.forEach(row => {
        const nameElement = row.querySelector('.candidate-name, .name, td:nth-child(2)');
        if (nameElement && nameElement.textContent.includes(candidate.name)) {
          // Add AI score badge
          if (!row.querySelector('.ai-score-badge')) {
            const badge = document.createElement('span');
            badge.className = 'ai-score-badge';
            badge.style.cssText = `
              background: ${result.decision === 'interview' ? '#10B981' : result.decision === 'review' ? '#F59E0B' : '#EF4444'};
              color: white;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
              margin-left: 8px;
            `;
            badge.textContent = `AI: ${result.overallScore}`;
            nameElement.appendChild(badge);
          }
          
          // Add decision indicator
          if (!row.querySelector('.ai-decision')) {
            const decision = document.createElement('span');
            decision.className = 'ai-decision';
            decision.style.cssText = `
              margin-left: 8px;
              font-weight: bold;
              color: ${result.decision === 'interview' ? '#10B981' : result.decision === 'review' ? '#F59E0B' : '#EF4444'};
            `;
            decision.textContent = result.decision.toUpperCase();
            
            const statusCell = row.querySelector('td:nth-child(4), .status');
            if (statusCell) {
              statusCell.appendChild(decision);
            }
          }
        }
      });
    });
  }

  exportResults(results) {
    const csv = this.convertResultsToCSV(results);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-screening-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    this.showNotification('Results exported successfully', 'success');
  }

  convertResultsToCSV(results) {
    const headers = [
      'Candidate Name',
      'Email',
      'Overall Score',
      'Job Match Score',
      'Decision',
      'Confidence',
      'Cultural Fit',
      'Growth Potential',
      'Tags',
      'Next Steps'
    ];
    
    const rows = results.map(result => {
      const candidate = this.selectedCandidates.find(c => c.id === result.candidateId);
      return [
        candidate?.name || '',
        candidate?.email || '',
        result.overallScore,
        result.jobMatchScore,
        result.decision,
        result.confidence,
        result.culturalFit,
        result.growthPotential,
        result.tags.join('; '),
        result.nextSteps.join('; ')
      ];
    });
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  updateKekaWithResults(results) {
    // This would integrate with Keka's API to update candidate statuses
    // For now, we'll just update the UI
    this.updateCandidateRowsWithResults(results);
    this.showNotification(`Updated ${results.length} candidates in Keka`, 'success');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `keka-ai-bridge-ui ai-notification ai-notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  observePageChanges() {
    // Monitor for page changes in single-page applications
    const observer = new MutationObserver(() => {
      // Re-detect page type and update UI if needed
      const oldPageType = this.pageType;
      this.detectKekaPageType();
      
      if (oldPageType !== this.pageType) {
        console.log('Page type changed, reinitializing...');
        this.setupDOMIntegration();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Add styles
const style = document.createElement('style');
style.textContent = `
  .keka-ai-bridge-ui {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  .ai-fab {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #2563EB;
    color: white;
    border-radius: 28px;
    padding: 12px 20px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    z-index: 9999;
    transition: all 0.3s ease;
  }
  
  .ai-fab:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
  }
  
  .ai-fab-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .ai-fab-counter {
    background: #EF4444;
    color: white;
    border-radius: 12px;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: bold;
  }
  
  .ai-control-panel {
    position: fixed;
    top: 80px;
    right: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    width: 320px;
    z-index: 9998;
  }
  
  .ai-panel-header {
    padding: 16px;
    border-bottom: 1px solid #E5E7EB;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .ai-panel-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
  
  .ai-panel-close {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #6B7280;
  }
  
  .ai-panel-body {
    padding: 16px;
  }
  
  .ai-status {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    font-size: 14px;
  }
  
  .ai-intake-section {
    margin-bottom: 16px;
  }
  
  .ai-intake-section label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
  }
  
  .ai-intake-select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    font-size: 14px;
  }
  
  .ai-btn {
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .ai-btn-primary {
    background: #2563EB;
    color: white;
  }
  
  .ai-btn-primary:hover:not(:disabled) {
    background: #1D4ED8;
  }
  
  .ai-btn-primary:disabled {
    background: #9CA3AF;
    cursor: not-allowed;
  }
  
  .ai-btn-secondary {
    background: #F3F4F6;
    color: #374151;
  }
  
  .ai-btn-secondary:hover {
    background: #E5E7EB;
  }
  
  .ai-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .ai-progress-modal,
  .ai-results-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  }
  
  .ai-modal-content {
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 500px;
    width: 90%;
  }
  
  .ai-modal-large {
    max-width: 800px;
  }
  
  .ai-progress-bar {
    background: #E5E7EB;
    height: 8px;
    border-radius: 4px;
    margin: 16px 0;
    overflow: hidden;
  }
  
  .ai-progress-fill {
    background: #2563EB;
    height: 100%;
    transition: width 0.3s ease;
  }
  
  .ai-progress-text {
    text-align: center;
    color: #6B7280;
    font-size: 14px;
  }
  
  .ai-results-summary {
    display: flex;
    justify-content: space-around;
    margin-bottom: 24px;
  }
  
  .ai-stat {
    text-align: center;
  }
  
  .ai-stat-number {
    display: block;
    font-size: 32px;
    font-weight: bold;
    color: #1F2937;
  }
  
  .ai-stat-label {
    display: block;
    font-size: 14px;
    color: #6B7280;
    margin-top: 4px;
  }
  
  .ai-results-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    border-bottom: 1px solid #E5E7EB;
  }
  
  .ai-tab {
    background: none;
    border: none;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #6B7280;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;
  }
  
  .ai-tab.active {
    color: #2563EB;
    border-bottom-color: #2563EB;
  }
  
  .ai-tab-content {
    display: none;
    max-height: 400px;
    overflow-y: auto;
  }
  
  .ai-tab-content.active {
    display: block;
  }
  
  .ai-result-card {
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
  }
  
  .ai-result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .ai-result-header h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
  
  .ai-scores {
    display: flex;
    gap: 12px;
  }
  
  .ai-score {
    font-size: 14px;
    font-weight: 500;
    color: #059669;
  }
  
  .ai-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
  }
  
  .ai-tag {
    background: #EBF8FF;
    color: #2563EB;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
  }
  
  .ai-reasoning,
  .ai-next-steps {
    margin-top: 12px;
    font-size: 14px;
  }
  
  .ai-reasoning strong,
  .ai-next-steps strong {
    display: block;
    margin-bottom: 4px;
  }
  
  .ai-reasoning ul,
  .ai-next-steps ul {
    margin: 0;
    padding-left: 20px;
  }
  
  .ai-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #E5E7EB;
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialize the bridge when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.kekaAIBridge = new KekaAIBridge();
  });
} else {
  window.kekaAIBridge = new KekaAIBridge();
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStatus') {
    sendResponse({
      initialized: window.kekaAIBridge?.isInitialized || false,
      selectedCount: window.kekaAIBridge?.selectedCandidates?.length || 0,
      pageType: window.kekaAIBridge?.pageType || 'unknown'
    });
  }
  
  if (request.action === 'startScreening') {
    if (window.kekaAIBridge) {
      window.kekaAIBridge.startAutonomousScreening();
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'Bridge not initialized' });
    }
  }
  
  return true;
});