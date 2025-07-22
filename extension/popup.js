// AI Resume Screener Popup Script
class PopupController {
  constructor() {
    this.currentTab = null;
    this.isKekaPage = false;
    this.stats = { screenedToday: 0, avgScore: 0 };
    this.init();
  }

  async init() {
    await this.getCurrentTab();
    await this.loadSettings();
    await this.loadStats();
    this.setupEventListeners();
    this.updateStatus();
  }

  async getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    this.currentTab = tab;
    this.isKekaPage = this.detectKekaPage(tab.url);
  }

  detectKekaPage(url) {
    return url && (
      url.includes('keka.com') || 
      url.includes('kekacloud.com') ||
      url.includes('keka.') ||
      // Add more Keka domain patterns as needed
      url.includes('localhost') // For testing
    );
  }

  async loadSettings() {
    const settings = await chrome.storage.sync.get([
      'autoScreen',
      'showWidget', 
      'autoTags',
      'openaiApiKey'
    ]);

    // Update toggle states
    this.updateToggle('auto-screen-toggle', settings.autoScreen || false);
    this.updateToggle('widget-toggle', settings.showWidget !== false); // Default true
    this.updateToggle('auto-tags-toggle', settings.autoTags !== false); // Default true

    // Check if API key is configured
    this.hasApiKey = !!settings.openaiApiKey;
  }

  async loadStats() {
    const today = new Date().toDateString();
    const stats = await chrome.storage.local.get([
      `screened_${today}`,
      'totalScreened',
      'avgScore'
    ]);

    this.stats.screenedToday = stats[`screened_${today}`] || 0;
    this.stats.avgScore = stats.avgScore || 0;

    // Update UI
    document.getElementById('screened-today').textContent = this.stats.screenedToday;
    document.getElementById('avg-score').textContent = 
      this.stats.avgScore > 0 ? Math.round(this.stats.avgScore) : '--';
  }

  updateToggle(toggleId, isActive) {
    const toggle = document.getElementById(toggleId);
    if (isActive) {
      toggle.classList.add('active');
    } else {
      toggle.classList.remove('active');
    }
  }

  setupEventListeners() {
    // Quick action buttons
    document.getElementById('screen-current').addEventListener('click', () => {
      this.screenCurrentCandidate();
    });

    document.getElementById('bulk-screen').addEventListener('click', () => {
      this.bulkScreenCandidates();
    });

    document.getElementById('upload-intake').addEventListener('click', () => {
      this.uploadIntakeDocument();
    });

    document.getElementById('open-dashboard').addEventListener('click', () => {
      this.openDashboard();
    });

    // Settings toggles
    document.getElementById('auto-screen-toggle').addEventListener('click', (e) => {
      this.toggleSetting('autoScreen', e.target);
    });

    document.getElementById('widget-toggle').addEventListener('click', (e) => {
      this.toggleSetting('showWidget', e.target);
    });

    document.getElementById('auto-tags-toggle').addEventListener('click', (e) => {
      this.toggleSetting('autoTags', e.target);
    });
  }

  updateStatus() {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    const statusDetails = document.getElementById('status-details');

    if (this.isKekaPage) {
      statusDot.classList.remove('inactive');
      statusText.textContent = 'Keka Detected';
      
      if (this.hasApiKey) {
        statusDetails.innerHTML = '✅ Ready to screen candidates';
      } else {
        statusDetails.innerHTML = '⚠️ API key required - <a href="#" id="setup-api">Setup</a>';
        document.getElementById('setup-api').addEventListener('click', () => {
          this.showApiSetup();
        });
      }
    } else {
      statusDot.classList.add('inactive');
      statusText.textContent = 'Not on Keka';
      statusDetails.innerHTML = 'Navigate to Keka to use AI screening';
    }

    // Update button states
    const screenBtn = document.getElementById('screen-current');
    const bulkBtn = document.getElementById('bulk-screen');
    
    if (this.isKekaPage && this.hasApiKey) {
      screenBtn.disabled = false;
      bulkBtn.disabled = false;
    } else {
      screenBtn.disabled = true;
      bulkBtn.disabled = true;
    }
  }

  async screenCurrentCandidate() {
    if (!this.isKekaPage || !this.hasApiKey) {
      this.showError('Please configure API key and navigate to Keka');
      return;
    }

    const button = document.getElementById('screen-current');
    const originalText = button.textContent;
    
    button.innerHTML = '<div class="loading"><div class="spinner"></div>Screening...</div>';
    button.disabled = true;

    try {
      // Send message to content script to perform screening
      await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'screenCandidate'
      });

      // Update stats
      await this.incrementScreenedCount();
      
      button.textContent = '✅ Screened!';
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 2000);

    } catch (error) {
      console.error('Screening failed:', error);
      button.textContent = '❌ Failed';
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 2000);
    }
  }

  async bulkScreenCandidates() {
    if (!this.isKekaPage || !this.hasApiKey) {
      this.showError('Please configure API key and navigate to Keka');
      return;
    }

    try {
      await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'bulkScreen'
      });
    } catch (error) {
      console.error('Bulk screening failed:', error);
      this.showError('Bulk screening failed');
    }
  }

  uploadIntakeDocument() {
    // Show intake document upload modal
    this.showIntakeUploadModal();
  }

  openDashboard() {
    // Open the main AI Resume Screener dashboard
    const dashboardUrl = 'https://ai-resume-screener-keka-hboecouh.sites.blink.new';
    chrome.tabs.create({ url: dashboardUrl });
  }

  async toggleSetting(settingName, toggleElement) {
    const isActive = !toggleElement.classList.contains('active');
    
    if (isActive) {
      toggleElement.classList.add('active');
    } else {
      toggleElement.classList.remove('active');
    }

    // Save setting
    await chrome.storage.sync.set({ [settingName]: isActive });

    // Apply setting immediately
    if (this.isKekaPage) {
      chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'updateSetting',
        setting: settingName,
        value: isActive
      }).catch(() => {
        // Content script might not be loaded yet
      });
    }
  }

  async incrementScreenedCount() {
    const today = new Date().toDateString();
    const key = `screened_${today}`;
    
    const result = await chrome.storage.local.get([key]);
    const newCount = (result[key] || 0) + 1;
    
    await chrome.storage.local.set({ [key]: newCount });
    
    // Update UI
    this.stats.screenedToday = newCount;
    document.getElementById('screened-today').textContent = newCount;
  }

  showApiSetup() {
    // Create a simple API key input modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;
    
    modal.innerHTML = `
      <div style="background: white; padding: 20px; border-radius: 8px; width: 300px; color: #333;">
        <h3 style="margin: 0 0 16px 0;">Setup OpenAI API Key</h3>
        <input type="password" id="api-key-input" placeholder="sk-..." 
               style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 16px;">
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button id="cancel-setup" style="padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">Cancel</button>
          <button id="save-api-key" style="padding: 8px 16px; background: #2563EB; color: white; border: none; border-radius: 4px; cursor: pointer;">Save</button>
        </div>
        <small style="color: #666; font-size: 11px; display: block; margin-top: 8px;">
          Your API key is stored locally and never shared.
        </small>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    modal.querySelector('#cancel-setup').addEventListener('click', () => {
      modal.remove();
    });
    
    modal.querySelector('#save-api-key').addEventListener('click', async () => {
      const apiKey = modal.querySelector('#api-key-input').value.trim();
      if (apiKey) {
        await chrome.storage.sync.set({ openaiApiKey: apiKey });
        this.hasApiKey = true;
        this.updateStatus();
        modal.remove();
      }
    });
    
    // Focus input
    modal.querySelector('#api-key-input').focus();
  }

  showIntakeUploadModal() {
    // Create intake document upload modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;
    
    modal.innerHTML = `
      <div style="background: white; padding: 24px; border-radius: 12px; width: 400px; color: #333; max-height: 80vh; overflow-y: auto;">
        <h3 style="margin: 0 0 16px 0; color: #2563EB;">📄 Upload Intake Document</h3>
        <p style="margin-bottom: 16px; color: #666; font-size: 14px;">
          Upload a job description or requirements document to improve screening accuracy. 
          The AI will use this document to better match candidates against specific job requirements.
        </p>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">Job Title:</label>
          <input type="text" id="job-title-input" placeholder="e.g., Senior Frontend Developer" 
                 style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;">
        </div>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">Department:</label>
          <input type="text" id="department-input" placeholder="e.g., Engineering" 
                 style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;">
        </div>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">Upload Document:</label>
          <input type="file" id="intake-file-input" accept=".pdf,.doc,.docx,.txt" 
                 style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
          <small style="color: #666; font-size: 12px; display: block; margin-top: 4px;">
            Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
          </small>
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">Or paste job description:</label>
          <textarea id="job-description-input" placeholder="Paste job description, requirements, or key skills here..." 
                    style="width: 100%; height: 120px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; resize: vertical;"></textarea>
        </div>
        
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button id="cancel-intake" style="padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer; font-size: 14px;">Cancel</button>
          <button id="save-intake" style="padding: 8px 16px; background: #2563EB; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">Save Intake Document</button>
        </div>
        
        <div style="margin-top: 16px; padding: 12px; background: #F0F9FF; border: 1px solid #BAE6FD; border-radius: 6px;">
          <p style="margin: 0; font-size: 12px; color: #0369A1;">
            💡 <strong>Pro Tip:</strong> The more detailed your intake document, the better the AI can match candidates. 
            Include specific skills, experience requirements, and job responsibilities.
          </p>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    modal.querySelector('#cancel-intake').addEventListener('click', () => {
      modal.remove();
    });
    
    modal.querySelector('#save-intake').addEventListener('click', async () => {
      await this.saveIntakeDocument(modal);
    });
    
    // Focus job title input
    modal.querySelector('#job-title-input').focus();
  }

  async saveIntakeDocument(modal) {
    const jobTitle = modal.querySelector('#job-title-input').value.trim();
    const department = modal.querySelector('#department-input').value.trim();
    const fileInput = modal.querySelector('#intake-file-input');
    const jobDescription = modal.querySelector('#job-description-input').value.trim();
    
    if (!jobTitle) {
      this.showError('Please enter a job title');
      return;
    }
    
    if (!fileInput.files[0] && !jobDescription) {
      this.showError('Please upload a document or paste job description');
      return;
    }
    
    const saveButton = modal.querySelector('#save-intake');
    const originalText = saveButton.textContent;
    saveButton.textContent = 'Saving...';
    saveButton.disabled = true;
    
    try {
      let documentContent = jobDescription;
      
      // If file is uploaded, read its content
      if (fileInput.files[0]) {
        const file = fileInput.files[0];
        
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error('File size must be less than 10MB');
        }
        
        // Read file content
        documentContent = await this.readFileContent(file);
      }
      
      // Create intake document object
      const intakeDocument = {
        id: `intake_${Date.now()}`,
        jobTitle,
        department: department || 'General',
        content: documentContent,
        fileName: fileInput.files[0]?.name || 'Manual Entry',
        createdAt: new Date().toISOString(),
        isActive: true
      };
      
      // Save to storage
      const existingDocs = await chrome.storage.local.get(['intakeDocuments']);
      const intakeDocuments = existingDocs.intakeDocuments || [];
      intakeDocuments.push(intakeDocument);
      
      await chrome.storage.local.set({ intakeDocuments });
      
      // Show success message
      saveButton.textContent = '✅ Saved!';
      setTimeout(() => {
        modal.remove();
        this.showSuccess('Intake document saved successfully! It will be used for future screenings.');
      }, 1000);
      
    } catch (error) {
      console.error('Failed to save intake document:', error);
      this.showError(`Failed to save: ${error.message}`);
      saveButton.textContent = originalText;
      saveButton.disabled = false;
    }
  }

  async readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target.result;
        
        // For text files, return content directly
        if (file.type.startsWith('text/')) {
          resolve(content);
          return;
        }
        
        // For other files, we'll need to extract text
        // For now, we'll just store the base64 content and handle extraction later
        if (file.type === 'application/pdf' || 
            file.type === 'application/msword' || 
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          
          // Convert to base64 for storage
          const base64Content = btoa(String.fromCharCode(...new Uint8Array(content)));
          resolve(`[FILE_CONTENT:${file.type}:${base64Content}]`);
        } else {
          reject(new Error('Unsupported file type'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      if (file.type.startsWith('text/')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  }

  showSuccess(message) {
    // Success notification
    const success = document.createElement('div');
    success.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #10B981;
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 1001;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    `;
    success.textContent = message;
    document.body.appendChild(success);
    
    setTimeout(() => success.remove(), 4000);
  }

  showError(message) {
    // Simple error notification
    const error = document.createElement('div');
    error.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #EF4444;
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 1001;
    `;
    error.textContent = message;
    document.body.appendChild(error);
    
    setTimeout(() => error.remove(), 3000);
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});