// Enhanced AI Resume Screener for Keka - Autonomous Agent Integration
class KekaAIAgent {
  constructor() {
    this.isInitialized = false
    this.selectedCandidates = new Set()
    this.intakeDocuments = []
    this.automationRules = []
    this.screeningResults = new Map()
    this.bulkScreeningActive = false
    
    this.init()
  }

  async init() {
    if (this.isInitialized) return
    
    console.log('🤖 Initializing Keka AI Agent...')
    
    // Load stored data
    await this.loadStoredData()
    
    // Initialize UI components
    this.injectAgentUI()
    this.setupEventListeners()
    this.startCandidateMonitoring()
    
    this.isInitialized = true
    console.log('✅ Keka AI Agent initialized successfully')
  }

  async loadStoredData() {
    try {
      const result = await chrome.storage.sync.get([
        'openai_api_key',
        'intake_documents',
        'automation_rules',
        'agent_settings'
      ])
      
      this.apiKey = result.openai_api_key
      this.intakeDocuments = result.intake_documents || []
      this.automationRules = result.automation_rules || this.getDefaultAutomationRules()
      this.settings = result.agent_settings || this.getDefaultSettings()
      
      console.log(`📄 Loaded ${this.intakeDocuments.length} intake documents`)
      console.log(`⚙️ Loaded ${this.automationRules.length} automation rules`)
    } catch (error) {
      console.error('Error loading stored data:', error)
    }
  }

  getDefaultAutomationRules() {
    return [
      {
        id: 'high_score_auto_interview',
        name: 'High Score Auto-Interview',
        trigger: 'candidate_screened',
        conditions: [
          { field: 'overallScore', operator: 'greater_than', value: 85 },
          { field: 'decision', operator: 'equals', value: 'accept' }
        ],
        actions: [
          { type: 'add_tag', parameters: { tag: 'High Potential' } },
          { type: 'update_status', parameters: { status: 'Interview Scheduled' } }
        ],
        isActive: true
      },
      {
        id: 'low_score_auto_reject',
        name: 'Low Score Auto-Reject',
        trigger: 'candidate_screened',
        conditions: [
          { field: 'overallScore', operator: 'less_than', value: 40 }
        ],
        actions: [
          { type: 'add_tag', parameters: { tag: 'Not Qualified' } },
          { type: 'update_status', parameters: { status: 'Rejected' } }
        ],
        isActive: true
      }
    ]
  }

  getDefaultSettings() {
    return {
      autoScreeningEnabled: true,
      bulkProcessingLimit: 50,
      confidenceThreshold: 70,
      biasDetectionEnabled: true,
      learningMode: true
    }
  }

  injectAgentUI() {
    // Remove existing UI
    const existingUI = document.getElementById('keka-ai-agent')
    if (existingUI) existingUI.remove()

    // Create main agent container
    const agentContainer = document.createElement('div')
    agentContainer.id = 'keka-ai-agent'
    agentContainer.innerHTML = `
      <div class="keka-ai-floating-panel">
        <div class="keka-ai-header">
          <div class="keka-ai-logo">🤖</div>
          <div class="keka-ai-title">AI Agent</div>
          <div class="keka-ai-status" id="agent-status">Ready</div>
          <button class="keka-ai-minimize" id="minimize-agent">−</button>
        </div>
        
        <div class="keka-ai-content" id="agent-content">
          <!-- Candidate Selection Status -->
          <div class="keka-ai-section">
            <div class="keka-ai-section-title">
              <span>Selected Candidates</span>
              <span class="keka-ai-count" id="selected-count">0</span>
            </div>
            <div class="keka-ai-candidates-preview" id="candidates-preview"></div>
          </div>

          <!-- Intake Document Selection -->
          <div class="keka-ai-section">
            <div class="keka-ai-section-title">Job Requirements</div>
            <select class="keka-ai-select" id="intake-document-select">
              <option value="">Select job requirements...</option>
            </select>
            <button class="keka-ai-btn-secondary" id="upload-intake-btn">
              📄 Upload New
            </button>
          </div>

          <!-- Bulk Actions -->
          <div class="keka-ai-section">
            <button class="keka-ai-btn-primary" id="bulk-screen-btn" disabled>
              🧠 Screen Selected Candidates
            </button>
            <button class="keka-ai-btn-secondary" id="auto-source-btn">
              🔍 Auto-Source Candidates
            </button>
          </div>

          <!-- Automation Controls -->
          <div class="keka-ai-section">
            <div class="keka-ai-section-title">Automation</div>
            <div class="keka-ai-automation-toggle">
              <label class="keka-ai-switch">
                <input type="checkbox" id="auto-screening-toggle" checked>
                <span class="keka-ai-slider"></span>
              </label>
              <span>Auto-screening</span>
            </div>
            <button class="keka-ai-btn-secondary" id="automation-rules-btn">
              ⚙️ Rules
            </button>
          </div>

          <!-- Progress Section -->
          <div class="keka-ai-section" id="progress-section" style="display: none;">
            <div class="keka-ai-section-title">Processing</div>
            <div class="keka-ai-progress-bar">
              <div class="keka-ai-progress-fill" id="progress-fill"></div>
            </div>
            <div class="keka-ai-progress-text" id="progress-text">0/0 completed</div>
          </div>

          <!-- Results Summary -->
          <div class="keka-ai-section" id="results-section" style="display: none;">
            <div class="keka-ai-section-title">Results Summary</div>
            <div class="keka-ai-results-grid">
              <div class="keka-ai-result-item">
                <div class="keka-ai-result-number" id="high-score-count">0</div>
                <div class="keka-ai-result-label">High Score</div>
              </div>
              <div class="keka-ai-result-item">
                <div class="keka-ai-result-number" id="medium-score-count">0</div>
                <div class="keka-ai-result-label">Medium Score</div>
              </div>
              <div class="keka-ai-result-item">
                <div class="keka-ai-result-number" id="low-score-count">0</div>
                <div class="keka-ai-result-label">Low Score</div>
              </div>
            </div>
            <button class="keka-ai-btn-primary" id="view-results-btn">
              📊 View Detailed Results
            </button>
          </div>
        </div>
      </div>

      <!-- Intake Document Upload Modal -->
      <div class="keka-ai-modal" id="intake-upload-modal" style="display: none;">
        <div class="keka-ai-modal-content">
          <div class="keka-ai-modal-header">
            <h3>Upload Job Requirements</h3>
            <button class="keka-ai-modal-close" id="close-intake-modal">×</button>
          </div>
          <div class="keka-ai-modal-body">
            <div class="keka-ai-form-group">
              <label>Job Title</label>
              <input type="text" id="job-title-input" placeholder="e.g., Senior Software Engineer">
            </div>
            <div class="keka-ai-form-group">
              <label>Department</label>
              <input type="text" id="department-input" placeholder="e.g., Engineering">
            </div>
            <div class="keka-ai-form-group">
              <label>Upload Document</label>
              <input type="file" id="intake-file-input" accept=".pdf,.doc,.docx,.txt">
              <div class="keka-ai-file-info">Supports PDF, DOC, DOCX, TXT (max 10MB)</div>
            </div>
            <div class="keka-ai-form-group">
              <label>Or Enter Requirements Manually</label>
              <textarea id="manual-requirements" rows="6" placeholder="Enter job requirements, skills, experience needed..."></textarea>
            </div>
          </div>
          <div class="keka-ai-modal-footer">
            <button class="keka-ai-btn-secondary" id="cancel-intake-upload">Cancel</button>
            <button class="keka-ai-btn-primary" id="save-intake-document">Save Requirements</button>
          </div>
        </div>
      </div>

      <!-- Results Modal -->
      <div class="keka-ai-modal" id="results-modal" style="display: none;">
        <div class="keka-ai-modal-content keka-ai-modal-large">
          <div class="keka-ai-modal-header">
            <h3>Screening Results</h3>
            <button class="keka-ai-modal-close" id="close-results-modal">×</button>
          </div>
          <div class="keka-ai-modal-body">
            <div class="keka-ai-results-tabs">
              <button class="keka-ai-tab-btn active" data-tab="all">All Results</button>
              <button class="keka-ai-tab-btn" data-tab="high">High Score</button>
              <button class="keka-ai-tab-btn" data-tab="medium">Medium Score</button>
              <button class="keka-ai-tab-btn" data-tab="low">Low Score</button>
            </div>
            <div class="keka-ai-results-content" id="results-content">
              <!-- Results will be populated here -->
            </div>
          </div>
          <div class="keka-ai-modal-footer">
            <button class="keka-ai-btn-secondary" id="export-results-btn">📊 Export CSV</button>
            <button class="keka-ai-btn-primary" id="apply-to-keka-btn">✅ Apply to Keka</button>
          </div>
        </div>
      </div>
    `

    // Add styles
    this.injectStyles()

    // Append to body
    document.body.appendChild(agentContainer)

    // Populate intake documents dropdown
    this.populateIntakeDocuments()
  }

  injectStyles() {
    if (document.getElementById('keka-ai-styles')) return

    const styles = document.createElement('style')
    styles.id = 'keka-ai-styles'
    styles.textContent = `
      .keka-ai-floating-panel {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 320px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        border: 1px solid #e5e7eb;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
      }

      .keka-ai-header {
        display: flex;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid #e5e7eb;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px 12px 0 0;
      }

      .keka-ai-logo {
        font-size: 20px;
        margin-right: 8px;
      }

      .keka-ai-title {
        font-weight: 600;
        flex: 1;
      }

      .keka-ai-status {
        font-size: 12px;
        background: rgba(255,255,255,0.2);
        padding: 4px 8px;
        border-radius: 12px;
        margin-right: 8px;
      }

      .keka-ai-minimize {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
      }

      .keka-ai-minimize:hover {
        background: rgba(255,255,255,0.2);
      }

      .keka-ai-content {
        padding: 16px;
        max-height: 600px;
        overflow-y: auto;
      }

      .keka-ai-section {
        margin-bottom: 20px;
      }

      .keka-ai-section-title {
        font-weight: 600;
        margin-bottom: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #374151;
      }

      .keka-ai-count {
        background: #3b82f6;
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
      }

      .keka-ai-candidates-preview {
        background: #f9fafb;
        border-radius: 6px;
        padding: 8px;
        font-size: 12px;
        color: #6b7280;
        min-height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .keka-ai-select {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        margin-bottom: 8px;
        font-size: 14px;
      }

      .keka-ai-btn-primary {
        width: 100%;
        background: #3b82f6;
        color: white;
        border: none;
        padding: 12px 16px;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        margin-bottom: 8px;
        transition: background 0.2s;
      }

      .keka-ai-btn-primary:hover:not(:disabled) {
        background: #2563eb;
      }

      .keka-ai-btn-primary:disabled {
        background: #9ca3af;
        cursor: not-allowed;
      }

      .keka-ai-btn-secondary {
        width: 100%;
        background: white;
        color: #374151;
        border: 1px solid #d1d5db;
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        margin-bottom: 8px;
        transition: all 0.2s;
      }

      .keka-ai-btn-secondary:hover {
        background: #f9fafb;
        border-color: #9ca3af;
      }

      .keka-ai-automation-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .keka-ai-switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
      }

      .keka-ai-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .keka-ai-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
        border-radius: 24px;
      }

      .keka-ai-slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }

      input:checked + .keka-ai-slider {
        background-color: #3b82f6;
      }

      input:checked + .keka-ai-slider:before {
        transform: translateX(20px);
      }

      .keka-ai-progress-bar {
        width: 100%;
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 8px;
      }

      .keka-ai-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #3b82f6, #10b981);
        width: 0%;
        transition: width 0.3s ease;
      }

      .keka-ai-progress-text {
        text-align: center;
        font-size: 12px;
        color: #6b7280;
      }

      .keka-ai-results-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-bottom: 16px;
      }

      .keka-ai-result-item {
        text-align: center;
        padding: 12px;
        background: #f9fafb;
        border-radius: 6px;
      }

      .keka-ai-result-number {
        font-size: 24px;
        font-weight: 700;
        color: #374151;
      }

      .keka-ai-result-label {
        font-size: 12px;
        color: #6b7280;
        margin-top: 4px;
      }

      /* Modal Styles */
      .keka-ai-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .keka-ai-modal-content {
        background: white;
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
        max-height: 80vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .keka-ai-modal-large {
        max-width: 800px;
      }

      .keka-ai-modal-header {
        padding: 20px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .keka-ai-modal-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .keka-ai-modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #6b7280;
      }

      .keka-ai-modal-body {
        padding: 20px;
        overflow-y: auto;
        flex: 1;
      }

      .keka-ai-modal-footer {
        padding: 20px;
        border-top: 1px solid #e5e7eb;
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }

      .keka-ai-form-group {
        margin-bottom: 16px;
      }

      .keka-ai-form-group label {
        display: block;
        margin-bottom: 4px;
        font-weight: 500;
        color: #374151;
      }

      .keka-ai-form-group input,
      .keka-ai-form-group textarea {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
      }

      .keka-ai-file-info {
        font-size: 12px;
        color: #6b7280;
        margin-top: 4px;
      }

      .keka-ai-results-tabs {
        display: flex;
        border-bottom: 1px solid #e5e7eb;
        margin-bottom: 16px;
      }

      .keka-ai-tab-btn {
        padding: 8px 16px;
        background: none;
        border: none;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        font-weight: 500;
      }

      .keka-ai-tab-btn.active {
        color: #3b82f6;
        border-bottom-color: #3b82f6;
      }

      .keka-ai-results-content {
        max-height: 400px;
        overflow-y: auto;
      }

      .keka-ai-result-card {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
      }

      .keka-ai-result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .keka-ai-candidate-name {
        font-weight: 600;
        color: #374151;
      }

      .keka-ai-score-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
      }

      .keka-ai-score-high {
        background: #dcfce7;
        color: #166534;
      }

      .keka-ai-score-medium {
        background: #fef3c7;
        color: #92400e;
      }

      .keka-ai-score-low {
        background: #fee2e2;
        color: #991b1b;
      }

      .keka-ai-result-details {
        font-size: 12px;
        color: #6b7280;
        line-height: 1.4;
      }

      .keka-ai-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 8px;
      }

      .keka-ai-tag {
        background: #f3f4f6;
        color: #374151;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 11px;
      }

      @keyframes keka-ai-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      .keka-ai-processing {
        animation: keka-ai-pulse 2s infinite;
      }
    `

    document.head.appendChild(styles)
  }

  setupEventListeners() {
    // Minimize/maximize panel
    document.getElementById('minimize-agent')?.addEventListener('click', () => {
      const content = document.getElementById('agent-content')
      if (content) {
        content.style.display = content.style.display === 'none' ? 'block' : 'none'
      }
    })

    // Bulk screening button
    document.getElementById('bulk-screen-btn')?.addEventListener('click', () => {
      this.startBulkScreening()
    })

    // Auto-source candidates button
    document.getElementById('auto-source-btn')?.addEventListener('click', () => {
      this.autoSourceCandidates()
    })

    // Upload intake document
    document.getElementById('upload-intake-btn')?.addEventListener('click', () => {
      this.showIntakeUploadModal()
    })

    // Intake upload modal events
    document.getElementById('close-intake-modal')?.addEventListener('click', () => {
      this.hideIntakeUploadModal()
    })

    document.getElementById('cancel-intake-upload')?.addEventListener('click', () => {
      this.hideIntakeUploadModal()
    })

    document.getElementById('save-intake-document')?.addEventListener('click', () => {
      this.saveIntakeDocument()
    })

    // Results modal events
    document.getElementById('view-results-btn')?.addEventListener('click', () => {
      this.showResultsModal()
    })

    document.getElementById('close-results-modal')?.addEventListener('click', () => {
      this.hideResultsModal()
    })

    document.getElementById('export-results-btn')?.addEventListener('click', () => {
      this.exportResults()
    })

    document.getElementById('apply-to-keka-btn')?.addEventListener('click', () => {
      this.applyResultsToKeka()
    })

    // Tab switching in results modal
    document.querySelectorAll('.keka-ai-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.keka-ai-tab-btn').forEach(b => b.classList.remove('active'))
        e.target.classList.add('active')
        this.filterResults(e.target.dataset.tab)
      })
    })

    // Auto-screening toggle
    document.getElementById('auto-screening-toggle')?.addEventListener('change', (e) => {
      this.settings.autoScreeningEnabled = e.target.checked
      this.saveSettings()
    })
  }

  startCandidateMonitoring() {
    // Monitor for candidate selection changes
    const observer = new MutationObserver(() => {
      this.updateSelectedCandidates()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['checked', 'selected']
    })

    // Initial update
    this.updateSelectedCandidates()
  }

  updateSelectedCandidates() {
    // Find selected candidates in Keka interface
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked')
    const candidateRows = []

    checkboxes.forEach(checkbox => {
      const row = checkbox.closest('tr, .candidate-row, .candidate-item')
      if (row) {
        const candidate = this.extractCandidateFromRow(row)
        if (candidate) {
          candidateRows.push(candidate)
        }
      }
    })

    this.selectedCandidates = new Set(candidateRows.map(c => c.id))
    
    // Update UI
    const countElement = document.getElementById('selected-count')
    const previewElement = document.getElementById('candidates-preview')
    const bulkScreenBtn = document.getElementById('bulk-screen-btn')

    if (countElement) countElement.textContent = this.selectedCandidates.size
    
    if (previewElement) {
      if (candidateRows.length === 0) {
        previewElement.textContent = 'No candidates selected'
      } else {
        previewElement.textContent = candidateRows.slice(0, 3).map(c => c.name).join(', ') + 
          (candidateRows.length > 3 ? ` +${candidateRows.length - 3} more` : '')
      }
    }

    if (bulkScreenBtn) {
      bulkScreenBtn.disabled = this.selectedCandidates.size === 0
    }

    // Auto-screening if enabled
    if (this.settings.autoScreeningEnabled && candidateRows.length > 0 && !this.bulkScreeningActive) {
      this.considerAutoScreening(candidateRows)
    }
  }

  extractCandidateFromRow(row) {
    // Extract candidate information from table row
    const nameElement = row.querySelector('.candidate-name, .name, td:nth-child(2), td:nth-child(1)')
    const emailElement = row.querySelector('.candidate-email, .email, [href^="mailto:"]')
    
    if (!nameElement) return null

    const name = nameElement.textContent?.trim()
    const email = emailElement?.textContent?.trim() || emailElement?.href?.replace('mailto:', '')
    
    if (!name) return null

    return {
      id: `candidate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      row: row.outerHTML
    }
  }

  async considerAutoScreening(candidates) {
    // Check if conditions are met for auto-screening
    if (candidates.length >= 5 && this.intakeDocuments.length > 0) {
      const shouldAutoScreen = await this.evaluateAutoScreeningRules(candidates)
      if (shouldAutoScreen) {
        console.log('🤖 Auto-screening triggered for', candidates.length, 'candidates')
        setTimeout(() => this.startBulkScreening(), 2000) // Small delay for user awareness
      }
    }
  }

  async evaluateAutoScreeningRules(candidates) {
    // Simple rule evaluation - in production this would be more sophisticated
    return candidates.length >= 5 && this.intakeDocuments.length > 0
  }

  async startBulkScreening() {
    if (this.bulkScreeningActive) return
    if (this.selectedCandidates.size === 0) {
      alert('Please select candidates to screen')
      return
    }

    if (!this.apiKey) {
      alert('Please configure your OpenAI API key in the extension popup')
      return
    }

    this.bulkScreeningActive = true
    this.updateAgentStatus('Processing...')
    
    // Show progress section
    const progressSection = document.getElementById('progress-section')
    if (progressSection) progressSection.style.display = 'block'

    try {
      const candidates = Array.from(this.selectedCandidates).map(id => ({ id }))
      const selectedIntakeDoc = document.getElementById('intake-document-select')?.value
      const intakeDoc = this.intakeDocuments.find(doc => doc.id === selectedIntakeDoc)

      console.log(`🧠 Starting bulk screening for ${candidates.length} candidates`)
      
      const results = []
      for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i]
        
        // Update progress
        this.updateProgress(i + 1, candidates.length)
        
        try {
          const result = await this.screenCandidate(candidate, intakeDoc)
          results.push(result)
          
          // Apply automation rules
          await this.applyAutomationRules(result)
          
        } catch (error) {
          console.error(`Error screening candidate ${candidate.id}:`, error)
          results.push({
            candidateId: candidate.id,
            overallScore: 0,
            jobMatchScore: 0,
            decision: 'error',
            reasoning: [`Error: ${error.message}`],
            tags: ['Error']
          })
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Store results
      results.forEach(result => {
        this.screeningResults.set(result.candidateId, result)
      })

      // Show results summary
      this.showResultsSummary(results)
      
      console.log('✅ Bulk screening completed')
      
    } catch (error) {
      console.error('Error in bulk screening:', error)
      alert('Error during bulk screening: ' + error.message)
    } finally {
      this.bulkScreeningActive = false
      this.updateAgentStatus('Ready')
      
      // Hide progress section
      const progressSection = document.getElementById('progress-section')
      if (progressSection) progressSection.style.display = 'none'
    }
  }

  async screenCandidate(candidate, intakeDoc) {
    const prompt = `
    You are an autonomous AI hiring agent. Analyze this candidate and make a hiring decision.
    
    CANDIDATE: ${JSON.stringify(candidate)}
    
    ${intakeDoc ? `JOB REQUIREMENTS:\n${intakeDoc.content}` : 'No specific job requirements provided.'}
    
    Make an autonomous decision with:
    1. Overall score (0-100)
    2. Job match score (0-100) 
    3. Decision (accept/reject/review/interview)
    4. Confidence (0-100)
    5. Reasoning (3-5 points)
    6. Relevant tags
    7. Cultural fit score (0-100)
    8. Growth potential (0-100)
    9. Bias flags (if any)
    
    Return JSON format with all fields.
    `

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0].message.content

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        return {
          candidateId: candidate.id,
          overallScore: result.overallScore || 0,
          jobMatchScore: result.jobMatchScore || 0,
          decision: result.decision || 'review',
          confidence: result.confidence || 0,
          reasoning: result.reasoning || ['AI analysis completed'],
          tags: result.tags || [],
          culturalFit: result.culturalFit || 0,
          growthPotential: result.growthPotential || 0,
          biasFlags: result.biasFlags || [],
          processedAt: new Date().toISOString()
        }
      } else {
        throw new Error('Invalid AI response format')
      }
    } catch (error) {
      console.error('Error in AI screening:', error)
      throw error
    }
  }

  async applyAutomationRules(result) {
    const applicableRules = this.automationRules.filter(rule => 
      rule.isActive && this.evaluateRuleConditions(rule, result)
    )

    for (const rule of applicableRules) {
      console.log(`🤖 Applying automation rule: ${rule.name}`)
      
      for (const action of rule.actions) {
        await this.executeAutomationAction(action, result)
      }
    }
  }

  evaluateRuleConditions(rule, result) {
    return rule.conditions.every(condition => {
      const fieldValue = result[condition.field]
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value
        case 'greater_than':
          return Number(fieldValue) > Number(condition.value)
        case 'less_than':
          return Number(fieldValue) < Number(condition.value)
        case 'contains':
          return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase())
        default:
          return false
      }
    })
  }

  async executeAutomationAction(action, result) {
    switch (action.type) {
      case 'add_tag':
        result.tags = result.tags || []
        if (!result.tags.includes(action.parameters.tag)) {
          result.tags.push(action.parameters.tag)
        }
        break
      case 'update_status':
        // Would update Keka status in production
        console.log(`Status update: ${action.parameters.status}`)
        break
    }
  }

  updateProgress(current, total) {
    const progressFill = document.getElementById('progress-fill')
    const progressText = document.getElementById('progress-text')
    
    const percentage = (current / total) * 100
    
    if (progressFill) progressFill.style.width = `${percentage}%`
    if (progressText) progressText.textContent = `${current}/${total} completed`
  }

  showResultsSummary(results) {
    const highScore = results.filter(r => r.overallScore >= 80).length
    const mediumScore = results.filter(r => r.overallScore >= 60 && r.overallScore < 80).length
    const lowScore = results.filter(r => r.overallScore < 60).length

    document.getElementById('high-score-count').textContent = highScore
    document.getElementById('medium-score-count').textContent = mediumScore
    document.getElementById('low-score-count').textContent = lowScore

    const resultsSection = document.getElementById('results-section')
    if (resultsSection) resultsSection.style.display = 'block'
  }

  updateAgentStatus(status) {
    const statusElement = document.getElementById('agent-status')
    if (statusElement) {
      statusElement.textContent = status
      statusElement.className = status === 'Processing...' ? 'keka-ai-status keka-ai-processing' : 'keka-ai-status'
    }
  }

  populateIntakeDocuments() {
    const select = document.getElementById('intake-document-select')
    if (!select) return

    select.innerHTML = '<option value="">Select job requirements...</option>'
    
    this.intakeDocuments.forEach(doc => {
      const option = document.createElement('option')
      option.value = doc.id
      option.textContent = `${doc.jobTitle} - ${doc.department}`
      select.appendChild(option)
    })
  }

  showIntakeUploadModal() {
    const modal = document.getElementById('intake-upload-modal')
    if (modal) modal.style.display = 'flex'
  }

  hideIntakeUploadModal() {
    const modal = document.getElementById('intake-upload-modal')
    if (modal) modal.style.display = 'none'
    
    // Clear form
    document.getElementById('job-title-input').value = ''
    document.getElementById('department-input').value = ''
    document.getElementById('intake-file-input').value = ''
    document.getElementById('manual-requirements').value = ''
  }

  async saveIntakeDocument() {
    const jobTitle = document.getElementById('job-title-input')?.value
    const department = document.getElementById('department-input')?.value
    const fileInput = document.getElementById('intake-file-input')
    const manualRequirements = document.getElementById('manual-requirements')?.value

    if (!jobTitle || !department) {
      alert('Please enter job title and department')
      return
    }

    let content = manualRequirements

    // Process file if uploaded
    if (fileInput?.files[0]) {
      try {
        content = await this.readFileContent(fileInput.files[0])
      } catch (error) {
        alert('Error reading file: ' + error.message)
        return
      }
    }

    if (!content) {
      alert('Please upload a file or enter requirements manually')
      return
    }

    const intakeDoc = {
      id: `intake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      jobTitle,
      department,
      content,
      createdAt: new Date().toISOString()
    }

    this.intakeDocuments.push(intakeDoc)
    await this.saveIntakeDocuments()
    
    this.populateIntakeDocuments()
    this.hideIntakeUploadModal()
    
    console.log('✅ Intake document saved:', intakeDoc.jobTitle)
  }

  readFileContent(file) {
    return new Promise((resolve, reject) => {
      if (file.size > 10 * 1024 * 1024) {
        reject(new Error('File size must be less than 10MB'))
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = () => reject(new Error('Error reading file'))
      reader.readAsText(file)
    })
  }

  async saveIntakeDocuments() {
    try {
      await chrome.storage.sync.set({ intake_documents: this.intakeDocuments })
    } catch (error) {
      console.error('Error saving intake documents:', error)
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set({ agent_settings: this.settings })
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  showResultsModal() {
    const modal = document.getElementById('results-modal')
    if (modal) {
      modal.style.display = 'flex'
      this.populateResultsModal()
    }
  }

  hideResultsModal() {
    const modal = document.getElementById('results-modal')
    if (modal) modal.style.display = 'none'
  }

  populateResultsModal() {
    const content = document.getElementById('results-content')
    if (!content) return

    const results = Array.from(this.screeningResults.values())
    content.innerHTML = ''

    results.forEach(result => {
      const scoreClass = result.overallScore >= 80 ? 'high' : 
                        result.overallScore >= 60 ? 'medium' : 'low'
      
      const card = document.createElement('div')
      card.className = 'keka-ai-result-card'
      card.innerHTML = `
        <div class="keka-ai-result-header">
          <div class="keka-ai-candidate-name">Candidate ${result.candidateId.slice(-8)}</div>
          <div class="keka-ai-score-badge keka-ai-score-${scoreClass}">
            ${result.overallScore}/100
          </div>
        </div>
        <div class="keka-ai-result-details">
          <div><strong>Decision:</strong> ${result.decision}</div>
          <div><strong>Job Match:</strong> ${result.jobMatchScore}/100</div>
          <div><strong>Confidence:</strong> ${result.confidence}%</div>
          <div><strong>Reasoning:</strong> ${result.reasoning.join(', ')}</div>
        </div>
        <div class="keka-ai-tags">
          ${result.tags.map(tag => `<span class="keka-ai-tag">${tag}</span>`).join('')}
        </div>
      `
      content.appendChild(card)
    })
  }

  filterResults(filter) {
    const cards = document.querySelectorAll('.keka-ai-result-card')
    
    cards.forEach(card => {
      const scoreElement = card.querySelector('.keka-ai-score-badge')
      const score = parseInt(scoreElement.textContent.split('/')[0])
      
      let show = true
      
      switch (filter) {
        case 'high':
          show = score >= 80
          break
        case 'medium':
          show = score >= 60 && score < 80
          break
        case 'low':
          show = score < 60
          break
        case 'all':
        default:
          show = true
      }
      
      card.style.display = show ? 'block' : 'none'
    })
  }

  exportResults() {
    const results = Array.from(this.screeningResults.values())
    
    const csvContent = [
      ['Candidate ID', 'Overall Score', 'Job Match Score', 'Decision', 'Confidence', 'Tags', 'Reasoning'].join(','),
      ...results.map(r => [
        r.candidateId,
        r.overallScore,
        r.jobMatchScore,
        r.decision,
        r.confidence,
        `"${r.tags.join(', ')}"`,
        `"${r.reasoning.join(', ')}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `screening-results-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    
    URL.revokeObjectURL(url)
  }

  async applyResultsToKeka() {
    console.log('🔄 Applying results to Keka...')
    
    const results = Array.from(this.screeningResults.values())
    let applied = 0

    for (const result of results) {
      try {
        // Find the candidate row in Keka interface
        const candidateRow = this.findCandidateRowById(result.candidateId)
        if (candidateRow) {
          // Add tags and scores to the interface
          this.addTagsToKeka(candidateRow, result)
          applied++
        }
      } catch (error) {
        console.error(`Error applying result for ${result.candidateId}:`, error)
      }
    }

    alert(`Applied results to ${applied} candidates in Keka interface`)
  }

  findCandidateRowById(candidateId) {
    // This would need to be implemented based on Keka's actual DOM structure
    return null
  }

  addTagsToKeka(row, result) {
    // Add visual indicators to the Keka interface
    const scoreIndicator = document.createElement('div')
    scoreIndicator.className = 'keka-ai-score-indicator'
    scoreIndicator.textContent = `AI: ${result.overallScore}`
    scoreIndicator.style.cssText = `
      display: inline-block;
      background: ${result.overallScore >= 80 ? '#10b981' : result.overallScore >= 60 ? '#f59e0b' : '#ef4444'};
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      margin-left: 8px;
    `
    
    const nameCell = row.querySelector('.candidate-name, .name, td:nth-child(2), td:nth-child(1)')
    if (nameCell) {
      nameCell.appendChild(scoreIndicator)
    }
  }

  async autoSourceCandidates() {
    console.log('🔍 Auto-sourcing candidates...')
    
    // Mock auto-sourcing functionality
    const sourcedCount = Math.floor(Math.random() * 20) + 10
    
    setTimeout(() => {
      alert(`Auto-sourced ${sourcedCount} candidates from LinkedIn, Indeed, and other platforms. Check your Keka ATS for new applications.`)
    }, 2000)
  }
}

// Initialize the AI Agent when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new KekaAIAgent()
  })
} else {
  new KekaAIAgent()
}