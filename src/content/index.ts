import { saveCheckpoint, getCheckpoint } from '../shared/storage';
import { getScrollableContainer, getScrollInfo, markAnchorElement, getAnchorElement } from '../shared/dom-utils';
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

const calculateTargetPosition = (checkpointY: number, checkpointMax: number, currentMax: number): number => {
  if (checkpointMax > currentMax + 1500) {
    const distanceFromBottom = checkpointMax - checkpointY;
    const targetY = currentMax - distanceFromBottom;

    return targetY < 0 ? 0 : targetY;
  }

  return Math.min(Math.max(0, checkpointY), currentMax);
};

chrome.runtime.onMessage.addListener(async (message) => {
  const currentUrl = window.location.href.split('#')[0];

  if (message.action === 'save_checkpoint') {
    const container = getScrollableContainer();
    const { scrollTop, maxScroll } = getScrollInfo(container);

    if (maxScroll <= 0) {
      showToast('Page is not scrollable');

      return;
    }
    
    try {
      markAnchorElement();

      await saveCheckpoint(currentUrl, scrollTop, maxScroll);

      showToast('Checkpoint Saved!');
    } catch (error) {
      console.error('SnapScroll: Failed to save checkpoint', error);

      showToast('Failed to save checkpoint');
    }
  } else if (message.action === 'jump_checkpoint') {
    try {
      const checkpoint = await getCheckpoint(currentUrl);

      if (!checkpoint) {
        showToast('No valid checkpoint found');

        return;
      }

      const container = getScrollableContainer();
      const anchoredEl = getAnchorElement();
      
      if (anchoredEl) {
        anchoredEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

        showToast('Restored Checkpoint');

        return;
      }

      const { maxScroll: currentMaxScroll } = getScrollInfo(container);
      const targetY = calculateTargetPosition(
        checkpoint.scrollY, 
        checkpoint.maxScroll, 
        currentMaxScroll
      );

      container.scrollTo({ top: targetY, behavior: 'smooth' });

      if (checkpoint.scrollY > targetY) {
        showToast('Jumped to closest point');
      } else {
        showToast('Restored Checkpoint');
      }
    } catch (error) {
      console.error('SnapScroll: Failed to get checkpoint', error);
    }
  } else if (message.action === 'delete_checkpoint') {
    showToast('Checkpoint Deleted');
  }
});
