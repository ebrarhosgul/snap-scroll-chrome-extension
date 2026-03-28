import { getCheckpoint } from '../shared/storage';
import { renderCommands } from '../shared/shortcuts';

let currentUrl = '';
const statusContainer = document.getElementById('status-container') as HTMLDivElement;
const btnJump = document.getElementById('btn-jump') as HTMLButtonElement;
const btnSave = document.getElementById('btn-save') as HTMLButtonElement;
const btnDelete = document.getElementById('btn-delete') as HTMLButtonElement;
const shortcutsContainer = document.getElementById('shortcuts-container') as HTMLDivElement;
const settingsLink = document.getElementById('settings-link') as HTMLAnchorElement;

const sendActionToContentScript = async (action: 'save_checkpoint' | 'jump_checkpoint') => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { action });
  }
}

const initPopup = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url) {
      renderError('Cannot read tab information.');

      return;
    }

    currentUrl = tab.url.split('#')[0];
    
    if (currentUrl.startsWith('chrome://') || currentUrl.startsWith('edge://')) {
      renderError('Snap Scroll does not work on internal browser pages.');

      return;
    }

    const checkpoint = await getCheckpoint(currentUrl);

    renderState(checkpoint);
  } catch (error) {
    console.error('Popup init failed', error);

    renderError('Failed to load status.');
  }
}

const renderState = (checkpoint: any | null) => {
  statusContainer.innerHTML = '';
  
  if (checkpoint) {
    const date = new Date(checkpoint.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    statusContainer.innerHTML = `
      <div class="checkpoint-details">
        <strong>Checkpoint Active</strong>
        <span style="opacity: 0.8; margin-top: 4px;">Saved today at ${date}</span>
      </div>
    `;

    btnJump.classList.remove('hidden');
    btnDelete.classList.remove('hidden');
    btnSave.classList.add('hidden');
  } else {
    statusContainer.innerHTML = `<p>No checkpoint saved for this page.</p>`;
    
    btnSave.classList.remove('hidden');
    btnJump.classList.add('hidden');
    btnDelete.classList.add('hidden');
  }
}

const renderError = (message: string) => {
  statusContainer.innerHTML = `<p style="color: var(--danger)">${message}</p>`;

  btnSave.classList.add('hidden');
  btnJump.classList.add('hidden');
  btnDelete.classList.add('hidden');
}

btnSave.addEventListener('click', async () => {
  await sendActionToContentScript('save_checkpoint');

  window.close();
});

btnJump.addEventListener('click', async () => {
  await sendActionToContentScript('jump_checkpoint');

  window.close();
});

btnDelete.addEventListener('click', async () => {
  await chrome.storage.local.remove(currentUrl);

  renderState(null);
});

settingsLink.addEventListener('click', (e) => {
  e.preventDefault();

  chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
});

document.addEventListener('DOMContentLoaded', async () => {
  await initPopup();
  if (shortcutsContainer) {
    await renderCommands(shortcutsContainer);
  }
});
