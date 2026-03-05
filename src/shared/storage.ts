import type { Checkpoint } from './types';
import { EXPIRATION_TIME } from './constants';

export const saveCheckpoint = async (url: string, scrollY: number, maxScroll: number): Promise<void> => {
  const data: Checkpoint = { url, scrollY, maxScroll, timestamp: Date.now() };

  await chrome.storage.local.set({ [url]: data });
};

export const getCheckpoint = async (url: string): Promise<Checkpoint | null> => {
  const result = await chrome.storage.local.get(url);
  const checkpoint = result[url] as Checkpoint;
  
  if (!checkpoint) return null;
  
  if (Date.now() - checkpoint.timestamp > EXPIRATION_TIME) {
    await chrome.storage.local.remove(url);

    return null;
  }
  
  return checkpoint;
};

export const deleteCheckpoint = async (url: string): Promise<void> => {
  await chrome.storage.local.remove(url);
};
