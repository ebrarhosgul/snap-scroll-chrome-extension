// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { getScrollableContainer, getScrollInfo } from './dom-utils';

describe('DOM Utilities - getScrollableContainer', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });
    
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 768, configurable: true });
    Object.defineProperty(document.body, 'scrollHeight', { value: 768, configurable: true });
  });

  it('should return window if the whole page is explicitly scrollable', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true });

    const container = getScrollableContainer();

    expect(container).toBe(window);
  });

  it('should return the widest central scrollable container when window is not scrollable', () => {
    const sidebar = document.createElement('div');
    sidebar.style.overflowY = 'auto';

    Object.defineProperty(sidebar, 'scrollHeight', { value: 2000 });
    Object.defineProperty(sidebar, 'clientHeight', { value: 500 });

    sidebar.getBoundingClientRect = () => ({
      left: 0, top: 0, right: 200, bottom: 500, width: 200, height: 500
    } as DOMRect);
    
    const mainContent = document.createElement('div');
    mainContent.style.overflowY = 'auto';

    Object.defineProperty(mainContent, 'scrollHeight', { value: 3000 });
    Object.defineProperty(mainContent, 'clientHeight', { value: 600 });

    mainContent.getBoundingClientRect = () => ({
      left: 250, top: 50, right: 950, bottom: 650, width: 700, height: 600
    } as DOMRect);
    
    document.body.appendChild(sidebar);
    document.body.appendChild(mainContent);

    const container = getScrollableContainer();

    expect(container).toBe(mainContent);
  });
});

describe('DOM Utilities - getScrollInfo', () => {
  it('should correctly calculate scrollTop and maxScroll for window', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });
    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });

    const info = getScrollInfo(window);

    expect(info.scrollTop).toBe(500);
    expect(info.maxScroll).toBe(1000);
  });

  it('should correctly calculate scrollTop and maxScroll for a div element', () => {
    const div = document.createElement('div');
    Object.defineProperty(div, 'scrollTop', { value: 150 });
    Object.defineProperty(div, 'scrollHeight', { value: 800 });
    Object.defineProperty(div, 'clientHeight', { value: 300 });

    const info = getScrollInfo(div);

    expect(info.scrollTop).toBe(150);
    expect(info.maxScroll).toBe(500);
  });
});
