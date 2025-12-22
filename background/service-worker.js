// Smooth Scroll Chrome - Background Service Worker

// Handle extension icon click (optional - opens popup by default)
chrome.action.onClicked.addListener(async (tab) => {
  // This only fires if there's no default_popup defined
  // Since we have a popup, this won't normally trigger
  try {
    await chrome.tabs.sendMessage(tab.id, { action: 'toggleWidget' });
  } catch (error) {
    console.error('Failed to toggle widget:', error);
  }
});

// Handle installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Smooth Scroll Chrome installed!');

    // Set default settings
    chrome.storage.local.set({
      defaultSpeed: 'medium',
      widgetPosition: { right: 20, bottom: 20 },
      widgetVisible: true
    });
  } else if (details.reason === 'update') {
    console.log('Smooth Scroll Chrome updated to version', chrome.runtime.getManifest().version);
  }
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle any background tasks if needed
  if (message.action === 'getSettings') {
    chrome.storage.local.get(['defaultSpeed', 'widgetPosition', 'widgetVisible'], (result) => {
      sendResponse(result);
    });
    return true; // Keep message channel open for async response
  }

  if (message.action === 'saveSettings') {
    chrome.storage.local.set(message.settings, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

console.log('Smooth Scroll Chrome: Service worker loaded');
