chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'save_checkpoint' || command === 'jump_checkpoint') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab?.id) {
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
