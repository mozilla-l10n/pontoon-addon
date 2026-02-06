import { TextEncoder, TextDecoder } from 'util'
import crypto from 'crypto';

import 'jest-webextension-mock';
import '@testing-library/jest-dom';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';

TimeAgo.addLocale(en);

globalThis.TextEncoder = TextEncoder;
// @ts-expect-error
globalThis.TextDecoder = TextDecoder;
// @ts-expect-error
globalThis.crypto = crypto;

// Ensure jest mock functions are present on the webextension mock where possible
const mb = (globalThis as any).mockBrowser || (globalThis as any).browser || {};
const ensure = (obj: any, key: string, def?: any) => {
	obj[key] = obj[key] && obj[key].mock ? obj[key] : (def !== undefined ? jest.fn().mockReturnValue(def) : jest.fn());
};

mb.runtime = mb.runtime || {};
ensure(mb.runtime, 'getURL', '');
ensure(mb.runtime, 'openOptionsPage');

mb.storage = mb.storage || {};
mb.storage.local = mb.storage.local || {};
ensure(mb.storage.local, 'get', {});
ensure(mb.storage.local, 'set');
ensure(mb.storage.local, 'remove');

mb.notifications = mb.notifications || {};
ensure(mb.notifications, 'create', '');
ensure(mb.notifications, 'clear', false);
mb.notifications.onClicked = mb.notifications.onClicked || { addListener: jest.fn() };

mb.contextMenus = mb.contextMenus || {};
ensure(mb.contextMenus, 'create');
ensure(mb.contextMenus, 'remove');

mb.browserAction = mb.browserAction || {};
ensure(mb.browserAction, 'openPopup');

mb.contentScripts = mb.contentScripts || {};
ensure(mb.contentScripts, 'register', { unregister: jest.fn() });

mb.tabs = mb.tabs || {};
ensure(mb.tabs, 'create');
ensure(mb.tabs, 'query', []);
ensure(mb.tabs, 'executeScript', []);

mb.alarms = mb.alarms || {};
ensure(mb.alarms, 'create');
mb.alarms.onAlarm = mb.alarms.onAlarm || { addListener: jest.fn() };

mb.pageAction = mb.pageAction || {};
ensure(mb.pageAction, 'setTitle');
ensure(mb.pageAction, 'setIcon');
ensure(mb.pageAction, 'show');
ensure(mb.pageAction, 'hide');
