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

const getScrollableContainer = (): Element | Window => {
  const windowMaxScroll = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;

  if (windowMaxScroll > 0) {
    return window;
  }

  const elements = document.querySelectorAll('*');
  let maxScore = 0;
  let bestContainer: Element | null = null;
  const viewportCenterX = window.innerWidth / 2;

  for (const el of elements) {
    if (el.scrollHeight > el.clientHeight) {
      const style = window.getComputedStyle(el);
      const overflowY = style.overflowY;

      if (overflowY === 'auto' || overflowY === 'scroll') {
        const rect = el.getBoundingClientRect();

        const visibleWidth = Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0);
        const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);

        if (visibleWidth <= 0 || visibleHeight <= 0) continue;

        const area = visibleWidth * visibleHeight;
        const isCentral = rect.left < viewportCenterX && rect.right > viewportCenterX;
        const score = area * visibleWidth * (isCentral ? 2 : 1);

        if (score > maxScore) {
          maxScore = score;
          bestContainer = el;
        }
      }
    }
  }

  return bestContainer || window;
};

const getScrollInfo = (container: Element | Window) => {
  if (container === window) {
    const maxScroll = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;

    return {
      scrollTop: window.scrollY,
      maxScroll: maxScroll
    };
  } else {
    const el = container as Element;

    return {
      scrollTop: el.scrollTop,
      maxScroll: el.scrollHeight - el.clientHeight
    };
  }
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
      await saveCheckpoint(currentUrl, scrollTop, maxScroll);

      showToast('Checkpoint Saved!');
    } catch (error) {
      console.error('SnapScroll: Failed to save checkpoint', error);

      showToast('Failed to save checkpoint');
    }
  } else if (message.action === 'jump_checkpoint') {
        try {
            const checkpoint = await getCheckpoint(currentUrl);
            
            if (checkpoint) {
                const container = getScrollableContainer();
                const { maxScroll: currentMaxScroll } = getScrollInfo(container);

                let targetY = checkpoint.scrollY;
                
                targetY = Math.min(Math.max(0, targetY), currentMaxScroll);
                
                container.scrollTo({
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
