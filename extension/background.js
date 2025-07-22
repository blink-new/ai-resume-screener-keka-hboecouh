// AI Resume Screener Background Service Worker
class BackgroundService {
  constructor() {
    this.init();
  }

  init() {
    // Listen for extension installation
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details);
    });

    // Listen for tab updates to detect Keka pages
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdate(tabId, changeInfo, tab);
    });

    // Listen for messages from content scripts and popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Set up context menus
    this.setupContextMenus();

    // Initialize storage with default settings
    this.initializeStorage();
  }

  handleInstallation(details) {
    if (details.reason === 'install') {
      console.log('🤖 AI Resume Screener installed');
      
      // Open welcome page
      chrome.tabs.create({
        url: chrome.runtime.getURL('welcome.html')
      });
      
      // Set default settings
      chrome.storage.sync.set({
        autoScreen: false,
        showWidget: true,
        autoTags: true,
        notificationsEnabled: true
      });
    } else if (details.reason === 'update') {
      console.log('🔄 AI Resume Screener updated');
      this.handleUpdate(details);
    }
  }

  handleTabUpdate(tabId, changeInfo, tab) {
    // Only process when page is completely loaded
    if (changeInfo.status !== 'complete' || !tab.url) return;

    const isKekaPage = this.isKekaPage(tab.url);
    
    if (isKekaPage) {
      console.log('🎯 Keka page detected:', tab.url);
      
      // Update extension badge
      chrome.action.setBadgeText({
        tabId: tabId,
        text: 'AI'
      });
      
      chrome.action.setBadgeBackgroundColor({
        tabId: tabId,
        color: '#2563EB'
      });

      // Inject content script if not already injected
      this.injectContentScript(tabId);
      
      // Check auto-screen setting
      this.checkAutoScreen(tabId, tab.url);
    } else {
      // Clear badge for non-Keka pages
      chrome.action.setBadgeText({
        tabId: tabId,
        text: ''
      });
    }
  }

  isKekaPage(url) {
    const kekaPatterns = [
      /https?:\/\/.*\.keka\.com/,
      /https?:\/\/.*\.kekacloud\.com/,
      /https?:\/\/.*keka\./,
      // Add more patterns as needed
      /localhost/ // For testing
    ];
    
    return kekaPatterns.some(pattern => pattern.test(url));
  }

  async injectContentScript(tabId) {
    try {
      // Check if content script is already injected
      const response = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
      if (response && response.status === 'ready') {
        return; // Already injected
      }
    } catch (error) {
      // Content script not injected, proceed with injection
    }

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });
      
      await chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ['styles.css']
      });
      
      console.log('✅ Content script injected into tab:', tabId);
    } catch (error) {
      console.error('❌ Failed to inject content script:', error);
    }
  }

  async checkAutoScreen(tabId, url) {
    const settings = await chrome.storage.sync.get(['autoScreen']);
    
    if (settings.autoScreen && this.isCandidatePage(url)) {
      // Wait a bit for page to fully load
      setTimeout(() => {
        chrome.tabs.sendMessage(tabId, {
          action: 'autoScreen'
        }).catch(() => {
          // Content script might not be ready yet
        });
      }, 2000);
    }
  }

  isCandidatePage(url) {
    const candidatePatterns = [
      /\/candidate/i,
      /\/applicant/i,
      /\/profile/i,
      /\/resume/i
    ];
    
    return candidatePatterns.some(pattern => pattern.test(url));
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.action) {
        case 'ping':
          sendResponse({ status: 'ready' });
          break;

        case 'screeningComplete':
          await this.handleScreeningComplete(message.data, sender.tab);
          sendResponse({ success: true });
          break;

        case 'getSettings':
          const settings = await chrome.storage.sync.get();
          sendResponse({ settings });
          break;

        case 'updateStats':
          await this.updateStats(message.data);
          sendResponse({ success: true });
          break;

        case 'showNotification':
          this.showNotification(message.data);
          sendResponse({ success: true });
          break;

        case 'openDashboard':
          chrome.tabs.create({
            url: 'https://ai-resume-screener-keka-hboecouh.sites.blink.new'
          });
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ error: error.message });
    }
  }

  async handleScreeningComplete(data, tab) {
    // Update statistics
    await this.updateScreeningStats(data);
    
    // Show notification if enabled
    const settings = await chrome.storage.sync.get(['notificationsEnabled']);
    if (settings.notificationsEnabled) {
      this.showScreeningNotification(data, tab);
    }
    
    // Log activity
    console.log('📊 Screening completed:', data);
  }

  async updateScreeningStats(data) {
    const today = new Date().toDateString();
    const stats = await chrome.storage.local.get([
      `screened_${today}`,
      'totalScreened',
      'scoreSum',
      'avgScore'
    ]);

    const screenedToday = (stats[`screened_${today}`] || 0) + 1;
    const totalScreened = (stats.totalScreened || 0) + 1;
    const scoreSum = (stats.scoreSum || 0) + (data.score || 0);
    const avgScore = scoreSum / totalScreened;

    await chrome.storage.local.set({
      [`screened_${today}`]: screenedToday,
      totalScreened,
      scoreSum,
      avgScore
    });
  }

  showScreeningNotification(data, tab) {
    const candidateName = data.candidateName || 'Candidate';
    const score = data.score || 0;
    
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: '🤖 AI Screening Complete',
      message: `${candidateName} scored ${score}/100`,
      contextMessage: `On ${tab.title}`,
      priority: 1
    });
  }

  setupContextMenus() {
    chrome.contextMenus.removeAll(() => {
      // Add context menu for Keka pages
      chrome.contextMenus.create({
        id: 'ai-screen-candidate',
        title: '🤖 AI Screen This Candidate',
        contexts: ['page', 'selection'],
        documentUrlPatterns: [
          'https://*.keka.com/*',
          'https://*.kekacloud.com/*'
        ]
      });

      chrome.contextMenus.create({
        id: 'ai-bulk-screen',
        title: '📊 Bulk Screen All Candidates',
        contexts: ['page'],
        documentUrlPatterns: [
          'https://*.keka.com/*',
          'https://*.kekacloud.com/*'
        ]
      });

      chrome.contextMenus.create({
        id: 'separator',
        type: 'separator',
        contexts: ['page'],
        documentUrlPatterns: [
          'https://*.keka.com/*',
          'https://*.kekacloud.com/*'
        ]
      });

      chrome.contextMenus.create({
        id: 'ai-dashboard',
        title: '📈 Open AI Dashboard',
        contexts: ['page'],
        documentUrlPatterns: [
          'https://*.keka.com/*',
          'https://*.kekacloud.com/*'
        ]
      });
    });

    // Handle context menu clicks
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      this.handleContextMenuClick(info, tab);
    });
  }

  async handleContextMenuClick(info, tab) {
    try {
      switch (info.menuItemId) {
        case 'ai-screen-candidate':
          await chrome.tabs.sendMessage(tab.id, {
            action: 'screenCandidate'
          });
          break;

        case 'ai-bulk-screen':
          await chrome.tabs.sendMessage(tab.id, {
            action: 'bulkScreen'
          });
          break;

        case 'ai-dashboard':
          chrome.tabs.create({
            url: 'https://ai-resume-screener-keka-hboecouh.sites.blink.new'
          });
          break;
      }
    } catch (error) {
      console.error('Context menu action failed:', error);
    }
  }

  async initializeStorage() {
    // Set up default storage structure
    const defaultSettings = {
      autoScreen: false,
      showWidget: true,
      autoTags: true,
      notificationsEnabled: true,
      theme: 'auto'
    };

    const currentSettings = await chrome.storage.sync.get();
    
    // Only set defaults for missing settings
    const settingsToSet = {};
    Object.keys(defaultSettings).forEach(key => {
      if (!(key in currentSettings)) {
        settingsToSet[key] = defaultSettings[key];
      }
    });

    if (Object.keys(settingsToSet).length > 0) {
      await chrome.storage.sync.set(settingsToSet);
    }
  }

  handleUpdate(details) {
    // Handle extension updates
    const previousVersion = details.previousVersion;
    const currentVersion = chrome.runtime.getManifest().version;
    
    console.log(`Updated from ${previousVersion} to ${currentVersion}`);
    
    // Perform any necessary migration or cleanup
    this.performMigration(previousVersion, currentVersion);
  }

  async performMigration(fromVersion, toVersion) {
    // Handle data migration between versions if needed
    console.log('Performing migration if needed...');
    
    // Example: Migrate old settings format
    // if (fromVersion < '1.1.0') {
    //   // Migrate old settings
    // }
  }

  showNotification(data) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: data.title || 'AI Resume Screener',
      message: data.message,
      priority: data.priority || 1
    });
  }
}

// Initialize background service
new BackgroundService();