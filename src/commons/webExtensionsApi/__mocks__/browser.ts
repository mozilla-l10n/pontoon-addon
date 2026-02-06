import 'jest-webextension-mock';

/*
  Simplified mock for tests: re-export the global `mockBrowser` created
  by `jest-webextension-mock`. This avoids duplicating mock factories
  and keeps a single source of truth for the mock shape.
*/
import type { Browser } from 'webextension-polyfill';

const _global = globalThis as unknown as {
  mockBrowser?: Browser;
  browser?: Browser;
};

const mock = (_global.mockBrowser ||
  _global.browser ||
  ({} as Browser)) as jest.Mocked<Browser>;

export default mock;
