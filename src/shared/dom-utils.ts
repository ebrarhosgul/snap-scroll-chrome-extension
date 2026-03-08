export const getScrollableContainer = (): Element | Window => {
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

export const getScrollInfo = (container: Element | Window) => {
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
