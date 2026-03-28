chrome.commands.onCommand.addListener(async (command) => {
  if (['save_checkpoint', 'jump_checkpoint', 'delete_checkpoint'].includes(command)) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab?.id) {
      if (command === 'delete_checkpoint' && tab.url) {
        chrome.storage.local.remove(tab.url.split('#')[0]);
      }
      
      try {
        await chrome.tabs.sendMessage(tab.id, { action: command });
      } catch (error) {
        console.warn(`Could not send ${command} to tab ${tab.id}. Content script might not be injected.`, error);
      }
    }
  }
});

chrome.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
  if (details.frameId === 0) {
    try {
      await chrome.tabs.sendMessage(details.tabId, { 
        action: 'spa_navigation', 
        url: details.url 
      });
    } catch (error) {
    }
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install' || details.reason === 'update') {
    chrome.contextMenus.create({
      id: 'snap-save',
      title: 'Save Checkpoint',
      contexts: ['all']
    });

    chrome.contextMenus.create({
      id: 'snap-jump',
      title: 'Jump to Checkpoint',
      contexts: ['all']
    });
  }

  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/onboarding/index.html') });
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  if (info.menuItemId === 'snap-save') {
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'save_checkpoint' });
    } catch (error) {
      console.warn('Could not send save_checkpoint to tab', error);
    }
  } else if (info.menuItemId === 'snap-jump') {
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'jump_checkpoint' });
    } catch (error) {
      console.warn('Could not send jump_checkpoint to tab', error);
    }
  }
});
