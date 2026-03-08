import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { saveCheckpoint, getCheckpoint, deleteCheckpoint } from './storage';
import { EXPIRATION_TIME } from './constants';

const mockStorage: Record<string, any> = {};

global.chrome = {
  storage: {
    local: {
      set: vi.fn(async (data) => {
        Object.assign(mockStorage, data);
      }),
      get: vi.fn(async (key: string) => {
        return { [key]: mockStorage[key] };
      }),
      remove: vi.fn(async (key: string) => {
        delete mockStorage[key];
      })
    }
  }
} as any;

describe('Storage Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    for (const key of Object.keys(mockStorage)) {
      delete mockStorage[key];
    }
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should correctly save, get, and delete a valid checkpoint', async () => {
    const url = 'https://example.com';
    vi.setSystemTime(new Date('2026-03-08T12:00:00Z'));

    await saveCheckpoint(url, 500, 1000);

    const checkpoint = await getCheckpoint(url);

    expect(checkpoint).not.toBeNull();
    expect(checkpoint?.scrollY).toBe(500);
    expect(checkpoint?.maxScroll).toBe(1000);

    await deleteCheckpoint(url);

    expect(global.chrome.storage.local.remove).toHaveBeenCalledWith(url);
  });

  it('should return null and remove the checkpoint if TTL (24 hours) is exceeded', async () => {
    const url = 'https://example.com/blog';

    const day1 = new Date('2026-03-09T12:00:00Z');

    vi.setSystemTime(day1);

    await saveCheckpoint(url, 250, 1500);

    const validCheckpoint = await getCheckpoint(url);

    expect(validCheckpoint).not.toBeNull();

    vi.setSystemTime(new Date(day1.getTime() + EXPIRATION_TIME + 1));

    const expiredCheckpoint = await getCheckpoint(url);

    expect(expiredCheckpoint).toBeNull();
    expect(global.chrome.storage.local.remove).toHaveBeenCalledWith(url);
  });
});
