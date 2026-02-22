/* eslint-disable jest/expect-expect */
import type { Browser } from 'webextension-polyfill';
import 'jest-webextension-mock';

const _global = globalThis as unknown as {
  mockBrowser?: Browser;
  browser?: Browser;
};

const mockBrowser = (_global.mockBrowser ||
  _global.browser ||
  ({} as Browser)) as jest.Mocked<Browser>;

import { getOneOption } from '../options';

import type { BackgroundMessage } from '.';
import {
  getNotificationsUrl,
  getPontoonProjectForTheCurrentTab,
  getSettingsUrl,
  getSignInURL,
  getUsersTeamFromPontoon,
  getTeamProjectUrl,
  markAllNotificationsAsRead,
  notificationBellIconScriptLoaded,
  pageLoaded,
  reportTranslatedTextToBugzilla,
  searchTextInPontoon,
  updateTeamsList,
} from '.';

jest.mock('@commons/webExtensionsApi/browser');
jest.mock('@commons/options');

(getOneOption as jest.Mock).mockImplementation((key: string) => {
  switch (key) {
    case 'locale_team':
      return 'cs';
    case 'pontoon_base_url':
      return 'https://localhost';
    default:
      throw new Error(`Missing mock value for option '${key}'.`);
  }
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('messagingClient', () => {
  it('getNotificationsUrl', async () => {
    const url = await getNotificationsUrl();

    expect(url).toBe(
      'https://localhost/notifications?utm_source=pontoon-addon',
    );
  });

  it('getSettingsUrl', async () => {
    const url = await getSettingsUrl();

    expect(url).toBe('https://localhost/settings/?utm_source=pontoon-addon');
  });

  it('getTeamProjectUrl', async () => {
    const url = await getTeamProjectUrl('/projects/firefox');

    expect(url).toBe('https://localhost/cs/firefox?utm_source=pontoon-addon');
  });

  it('getSignInURL', async () => {
    const url = await getSignInURL();

    expect(url).toBe('https://localhost/accounts/fxa/login');
  });

  it('updateTeamsList', async () => {
    const mockTeamsList: BackgroundMessage['UPDATE_TEAMS_LIST']['response'] = {
      cs: 'Czech',
    };
    (mockBrowser.runtime.sendMessage as jest.Mock).mockResolvedValueOnce(
      mockTeamsList,
    );

    const teams = await updateTeamsList();

    expect(mockBrowser.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'update-teams-list',
    });
    expect(teams).toStrictEqual(mockTeamsList);
  });

  it('getUsersTeamFromPontoon', async () => {
    (mockBrowser.runtime.sendMessage as jest.Mock).mockResolvedValueOnce('cs');

    const team = await getUsersTeamFromPontoon();

    expect(mockBrowser.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'get-team-from-pontoon',
    });
    expect(team).toBe('cs');
  });

  it('getPontoonProjectForTheCurrentTab', async () => {
    const mockProject: BackgroundMessage['GET_CURRENT_TAB_PROJECT']['response'] =
      {
        slug: 'firefox',
        name: 'Firefox',
        domains: [],
      };
    (mockBrowser.runtime.sendMessage as jest.Mock).mockResolvedValueOnce(
      mockProject,
    );

    const project = await getPontoonProjectForTheCurrentTab();

    expect(mockBrowser.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'get-current-tab-project',
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(project).toStrictEqual(mockProject);
  });

  it('pageLoaded', async () => {
    (mockBrowser.runtime.sendMessage as jest.Mock).mockResolvedValueOnce(
      undefined,
    );

    await pageLoaded('<html></html>');
    expect(mockBrowser.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'pontoon-page-loaded',
      documentHTML: '<html></html>',
    });
  });

  it('markAllNotificationsAsRead', async () => {
    (mockBrowser.runtime.sendMessage as jest.Mock).mockResolvedValueOnce(
      undefined,
    );

    await markAllNotificationsAsRead();
    expect(mockBrowser.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'notifications-read',
    });
  });

  it('searchTextInPontoon', async () => {
    (mockBrowser.runtime.sendMessage as jest.Mock).mockResolvedValueOnce(
      undefined,
    );

    await searchTextInPontoon('foo bar');
    expect(mockBrowser.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'search-text-in-pontoon',
      text: 'foo bar',
    });
  });

  it('reportTranslatedTextToBugzilla', async () => {
    (mockBrowser.runtime.sendMessage as jest.Mock).mockResolvedValueOnce(
      undefined,
    );

    await reportTranslatedTextToBugzilla('foo bar');
    expect(mockBrowser.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'report-translated-text-to-bugzilla',
      text: 'foo bar',
    });
  });

  it('notificationBellIconScriptLoaded', async () => {
    (mockBrowser.runtime.sendMessage as jest.Mock).mockResolvedValueOnce({
      type: 'enable-notifications-bell-script',
    });

    const response = await notificationBellIconScriptLoaded();

    expect(mockBrowser.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'notifications-bell-script-loaded',
    });
    expect(response).toStrictEqual({
      type: 'enable-notifications-bell-script',
    });
  });
});
