import type * as WebExt from 'webextension-polyfill';

declare global {
  const mockBrowser: typeof WebExt;
}

export {};
