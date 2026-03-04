import { saveCheckpoint, getCheckpoint } from '../shared/storage';
import './toast.css';

const showToast = (message: string, durationMs = 2500) => {
  const existingToast = document.getElementById('snapscroll-toast-el');

  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.id = 'snapscroll-toast-el';
  toast.className = 'snapscroll-toast';
  toast.textContent = message;

  document.body.appendChild(toast);

  void toast.offsetWidth;

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');

    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }, durationMs);
};

chrome.runtime.onMessage.addListener(async (message) => {
  const currentUrl = window.location.href.split('#')[0];

  if (message.action === 'save_checkpoint') {
    const maxScroll = Math.max(
      document.body.scrollHeight, 
      document.documentElement.scrollHeight
    ) - window.innerHeight;

    if (maxScroll <= 0) {
      showToast('Page is not scrollable');

      return;
    }

    const currentScroll = window.scrollY;
    
    try {
      await saveCheckpoint(currentUrl, currentScroll);

      showToast('Checkpoint Saved!');
    } catch (error) {
      console.error('SnapScroll: Failed to save checkpoint', error);

      showToast('Failed to save checkpoint');
    }
  } else if (message.action === 'jump_checkpoint') {
        try {
            const checkpoint = await getCheckpoint(currentUrl);
            
            if (checkpoint) {
                const maxScroll = Math.max(
                    document.body.scrollHeight, 
                    document.documentElement.scrollHeight
                ) - window.innerHeight;

                const targetY = Math.min(checkpoint.scrollY, maxScroll);
                
                window.scrollTo({
                    top: targetY,
                    behavior: 'smooth'
                });

                if (checkpoint.scrollY > targetY) {
                    showToast('Jumped to closest possible point');
                } else {
                    showToast('Restored Checkpoint!');
                }
            } else {
                showToast('No valid checkpoint found');
            }
        } catch (error) {
            console.error('SnapScroll: Failed to get checkpoint', error);
        }
  } else if (message.action === 'delete_checkpoint') {
    showToast('Checkpoint Deleted');
  }
});
