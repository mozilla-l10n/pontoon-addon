/* eslint-disable jest/expect-expect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Tabs } from 'webextension-polyfill';
import 'jest-webextension-mock';

const mockBrowser =
  (globalThis as any).mockBrowser || (globalThis as any).browser || {};

import { defaultOptionsFor } from '../data/defaultOptions';

import {
  browser,
  browserFamily,
  closeNotification,
  createContextMenu,
  createNotification,
  deleteFromStorage,
  executeScript,
  getAllContainers,
  getAllTabs,
  getFromStorage,
  getOneFromStorage,
  getTabsWithBaseUrl,
  getActiveTab,
  getResourceUrl,
  hideAddressBarIcon,
  openIntro,
  openNewTab,
  openOptions,
  openPrivacyPolicy,
  openSnakeGame,
  openToolbarButtonPopup,
  removeContextMenu,
  requestPermissionForPontoon,
  saveToStorage,
  showAddressBarIcon,
  supportsAddressBar,
  supportsContainers,
  registerScriptForBaseUrl,
  callWithInterval,
  callDelayed,
  listenToMessages,
  listenToMessagesAndRespond,
  getTabsMatching,
} from '.';

jest.mock('@commons/webExtensionsApi/browser');
jest.mock('@commons/data/defaultOptions');

(defaultOptionsFor as jest.Mock).mockImplementation(() => ({
  locale_team: 'en',
}));

describe('webExtensionsApi', () => {
  it('exports browser', () => {
    expect(browser).toBeTruthy();
  });

  it('getFromStorage', async () => {
    (mockBrowser.storage.local.get as jest.Mock).mockResolvedValue({});

    await getFromStorage(['projectsList']);
    expect(mockBrowser.storage.local.get).toHaveBeenCalledWith([
      'projectsList',
    ]);
  });

  it('getOneFromStorage', async () => {
    (mockBrowser.storage.local.get as jest.Mock).mockResolvedValue({});

    await getOneFromStorage('projectsList');
    expect(mockBrowser.storage.local.get).toHaveBeenCalledWith([
      'projectsList',
    ]);
  });

  it('saveToStorage', async () => {
    (mockBrowser.storage.local.set as jest.Mock).mockResolvedValue(undefined);

    await saveToStorage({ projectsList: {} });
    expect(mockBrowser.storage.local.set).toHaveBeenCalledWith({
      projectsList: {},
    });
  });

  it('deleteFromStorage', async () => {
    (mockBrowser.storage.local.remove as jest.Mock).mockResolvedValue(
      undefined,
    );

    await deleteFromStorage('projectsList');
    expect(mockBrowser.storage.local.remove).toHaveBeenCalledWith([
      'projectsList',
    ]);
  });

  it('createNotification', async () => {
    (mockBrowser.notifications.create as jest.Mock).mockResolvedValue('id');
    mockBrowser.notifications.onClicked = { addListener: jest.fn() };

    await createNotification({ type: 'basic', title: 'foo', message: 'bar' });

    expect(mockBrowser.notifications.create).toHaveBeenCalledWith({
      type: 'basic',
      title: 'foo',
      message: 'bar',
    });
    expect(
      mockBrowser.notifications.onClicked.addListener,
    ).toHaveBeenCalledWith(expect.any(Function));
  });

  it('closeNotification', async () => {
    (mockBrowser.notifications.clear as jest.Mock).mockResolvedValue(true);

    await closeNotification('id');
    expect(mockBrowser.notifications.clear).toHaveBeenCalledWith('id');
  });

  it('createContextMenu', () => {
    (mockBrowser.contextMenus.create as jest.Mock).mockReturnValue('id');

    createContextMenu({ title: 'foo' });
    expect(mockBrowser.contextMenus.create).toHaveBeenCalledWith({
      title: 'foo',
    });
  });

  it('removeContextMenu', async () => {
    (mockBrowser.contextMenus.remove as jest.Mock).mockResolvedValue(undefined);

    await removeContextMenu('id');
    expect(mockBrowser.contextMenus.remove).toHaveBeenCalledWith('id');
  });

  it('browserFamily', () => {
    (mockBrowser.runtime.getURL as jest.Mock).mockReturnValue(
      'moz-extension://index.html',
    );
    expect(browserFamily()).toBe('mozilla');

    (mockBrowser.runtime.getURL as jest.Mock).mockReturnValue(
      'chrome-extension://index.html',
    );
    expect(browserFamily()).toBe('chromium');
  });

  it('openNewTab', async () => {
    (mockBrowser.tabs.create as jest.Mock).mockResolvedValue({} as Tabs.Tab);

    await openNewTab('https://localhost');
    expect(mockBrowser.tabs.create).toHaveBeenCalledWith({
      url: 'https://localhost',
    });
  });

  it('getAllTabs', async () => {
    (mockBrowser.tabs.query as jest.Mock).mockResolvedValue([]);

    await getAllTabs();
    expect(mockBrowser.tabs.query).toHaveBeenCalledWith({});
  });

  it('getTabsMatching', async () => {
    (mockBrowser.tabs.query as jest.Mock).mockResolvedValue([]);

    await getTabsMatching('https://localhost/*', 'https://127.0.0.1/*');
    expect(mockBrowser.tabs.query).toHaveBeenCalledWith({
      url: ['https://localhost/*', 'https://127.0.0.1/*'],
    });
  });

  it('getTabsWithBaseUrl', async () => {
    (mockBrowser.tabs.query as jest.Mock).mockResolvedValue([]);

    await getTabsWithBaseUrl('https://localhost');
    expect(mockBrowser.tabs.query).toHaveBeenCalledWith({
      url: ['https://localhost/*'],
    });
  });

  it('getActiveTab', async () => {
    (mockBrowser.tabs.query as jest.Mock).mockResolvedValue([
      {
        index: 0,
        highlighted: true,
        active: true,
        pinned: false,
        incognito: false,
      },
    ]);

    await getActiveTab();
    expect(mockBrowser.tabs.query).toHaveBeenCalledWith({
      currentWindow: true,
      active: true,
    });
  });

  it('getResourceUrl', () => {
    (mockBrowser.runtime.getURL as jest.Mock).mockReturnValue('');

    getResourceUrl('foo');
    expect(mockBrowser.runtime.getURL).toHaveBeenCalledWith('foo');
  });

  it('openOptions', async () => {
    (mockBrowser.runtime.openOptionsPage as jest.Mock).mockResolvedValue(
      undefined,
    );

    await openOptions();
    expect(mockBrowser.runtime.openOptionsPage).toHaveBeenCalled();
  });

  it('openIntro', async () => {
    (mockBrowser.runtime.getURL as jest.Mock).mockReturnValue(
      'https://localhost',
    );
    (mockBrowser.tabs.create as jest.Mock).mockResolvedValue({} as Tabs.Tab);

    await openIntro();
    expect(mockBrowser.runtime.getURL).toHaveBeenCalledWith(
      'frontend/intro.html',
    );
    expect(mockBrowser.tabs.create).toHaveBeenCalledWith({
      url: 'https://localhost',
    });
  });

  it('openPrivacyPolicy', async () => {
    (mockBrowser.runtime.getURL as jest.Mock).mockReturnValue(
      'https://localhost',
    );
    (mockBrowser.tabs.create as jest.Mock).mockResolvedValue({} as Tabs.Tab);

    await openPrivacyPolicy();
    expect(mockBrowser.runtime.getURL).toHaveBeenCalledWith(
      'frontend/privacy-policy.html',
    );
    expect(mockBrowser.tabs.create).toHaveBeenCalledWith({
      url: 'https://localhost',
    });
  });

  it('openSnakeGame', async () => {
    (mockBrowser.runtime.getURL as jest.Mock).mockReturnValue(
      'https://localhost',
    );
    (mockBrowser.tabs.create as jest.Mock).mockResolvedValue({} as Tabs.Tab);

    await openSnakeGame();
    expect(mockBrowser.runtime.getURL).toHaveBeenCalledWith(
      'frontend/snake-game.html',
    );
    expect(mockBrowser.tabs.create).toHaveBeenCalledWith({
      url: 'https://localhost',
    });
  });

  it('openToolbarButtonPopup', async () => {
    (mockBrowser.browserAction.openPopup as jest.Mock).mockResolvedValue(
      undefined,
    );

    await openToolbarButtonPopup();
    expect(mockBrowser.browserAction.openPopup).toHaveBeenCalled();
  });

  it('supportsAddressBar', () => {
    // Ensure the pageAction API exists
    mockBrowser.pageAction = mockBrowser.pageAction || {};
    expect(supportsAddressBar()).toBe(true);
  });

  it('showAddressBarIcon', async () => {
    mockBrowser.pageAction.setTitle = jest.fn();
    (mockBrowser.pageAction.setIcon as jest.Mock) = jest
      .fn()
      .mockResolvedValue(undefined);
    (mockBrowser.pageAction.show as jest.Mock) = jest
      .fn()
      .mockResolvedValue(undefined);

    await showAddressBarIcon({ id: 42 } as Tabs.Tab, 'foo', {
      16: '16.svg',
      32: '32.svg',
    });

    expect(mockBrowser.pageAction.setTitle).toHaveBeenCalledWith({
      tabId: 42,
      title: 'foo',
    });
    expect(mockBrowser.pageAction.setIcon).toHaveBeenCalledWith({
      tabId: 42,
      path: { 16: '16.svg', 32: '32.svg' },
    });
    expect(mockBrowser.pageAction.show).toHaveBeenCalledWith(42);
  });

  it('hideAddressBarIcon', async () => {
    mockBrowser.pageAction.setTitle = jest.fn();
    (mockBrowser.pageAction.setIcon as jest.Mock) = jest
      .fn()
      .mockResolvedValue(undefined);
    (mockBrowser.pageAction.hide as jest.Mock) = jest
      .fn()
      .mockResolvedValue(undefined);

    await hideAddressBarIcon({ id: 42 } as Tabs.Tab, 'foo');

    expect(mockBrowser.pageAction.setTitle).toHaveBeenCalledWith({
      tabId: 42,
      title: 'foo',
    });
    expect(mockBrowser.pageAction.setIcon).toHaveBeenCalledWith({ tabId: 42 });
    expect(mockBrowser.pageAction.hide).toHaveBeenCalledWith(42);
  });

  it('supportsContainers', () => {
    mockBrowser.contextualIdentities = mockBrowser.contextualIdentities || {
      query: jest.fn(),
    };
    expect(supportsContainers()).toBe(true);
  });

  it('getAllContainers', async () => {
    (mockBrowser.contextualIdentities.query as jest.Mock).mockResolvedValue([]);

    await getAllContainers();
    expect(mockBrowser.contextualIdentities.query).toHaveBeenCalledWith({});
  });

  it('requestPermissionForPontoon', async () => {
    (mockBrowser.permissions.request as jest.Mock).mockResolvedValue(true);

    const granted = await requestPermissionForPontoon('https://localhost');

    expect(mockBrowser.permissions.request).toHaveBeenCalledWith({
      origins: ['https://localhost/*'],
    });
    expect(granted).toBe(true);
  });

  it('registerScriptForBaseUrl', async () => {
    (mockBrowser.contentScripts.register as jest.Mock).mockResolvedValue({
      unregister: jest.fn(),
    });

    await registerScriptForBaseUrl('https://localhost', 'foo/bar.js');
    expect(mockBrowser.contentScripts.register).toHaveBeenCalled();
  });

  it('executeScript', async () => {
    (mockBrowser.tabs.executeScript as jest.Mock).mockResolvedValue([]);

    await executeScript(42, 'foo/bar.js');
    expect(mockBrowser.tabs.executeScript).toHaveBeenCalledWith(42, {
      file: 'foo/bar.js',
    });
  });

  it('callWithInterval', () => {
    (mockBrowser.alarms.create as jest.Mock) = jest.fn();
    mockBrowser.alarms.onAlarm = { addListener: jest.fn() };

    callWithInterval('name', { periodInMinutes: 42 }, jest.fn());

    expect(mockBrowser.alarms.create).toHaveBeenCalledWith('name', {
      periodInMinutes: 42,
    });
    expect(mockBrowser.alarms.onAlarm.addListener).toHaveBeenCalledWith(
      expect.any(Function),
    );
  });

  it('callDelayed', () => {
    (mockBrowser.alarms.create as jest.Mock) = jest.fn();
    mockBrowser.alarms.onAlarm = { addListener: jest.fn() };

    callDelayed({ delayInSeconds: 30 }, jest.fn());

    expect(mockBrowser.alarms.create).toHaveBeenCalled();
    expect(mockBrowser.alarms.onAlarm.addListener).toHaveBeenCalledWith(
      expect.any(Function),
    );
  });

  it('listenToMessages', () => {
    mockBrowser.runtime.onMessage = { addListener: jest.fn() };

    listenToMessages<'SEARCH_TEXT_IN_PONTOON'>(
      'search-text-in-pontoon',
      jest.fn(),
    );

    expect(mockBrowser.runtime.onMessage.addListener).toHaveBeenCalledWith(
      expect.any(Function),
    );
  });

  it('listenToMessagesAndRespond', () => {
    mockBrowser.runtime.onMessage = { addListener: jest.fn() };

    listenToMessagesAndRespond<'UPDATE_TEAMS_LIST'>(
      'update-teams-list',
      jest.fn(),
    );

    expect(mockBrowser.runtime.onMessage.addListener).toHaveBeenCalledWith(
      expect.any(Function),
    );
  });
});
