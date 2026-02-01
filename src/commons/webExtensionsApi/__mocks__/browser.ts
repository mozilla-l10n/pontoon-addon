import 'jest-webextension-mock';

/*
  Simplified mock for tests: re-export the global `mockBrowser` created
  by `jest-webextension-mock`. This avoids duplicating mock factories
  and keeps a single source of truth for the mock shape.
*/
/* eslint-disable @typescript-eslint/no-explicit-any */

const mock =
  (globalThis as any).mockBrowser || (globalThis as any).browser || {};

export default mock;
