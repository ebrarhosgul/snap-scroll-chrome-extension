import { renderCommands } from '../shared/shortcuts';

const shortcutsContainer = document.getElementById('shortcuts-container') as HTMLDivElement;
const settingsLink = document.getElementById('settings-link') as HTMLAnchorElement;

if (settingsLink) {
  settingsLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  if (shortcutsContainer) {
    await renderCommands(shortcutsContainer);
  }
});
