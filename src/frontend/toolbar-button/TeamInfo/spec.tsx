import type { Tabs } from 'webextension-polyfill';
import React from 'react';
import { render, screen, within, act } from '@testing-library/react';
import flushPromises from 'flush-promises';

import type { StorageContent } from '@commons/webExtensionsApi';
import {
  getActiveTab,
  getFromStorage,
  openNewTab,
} from '@commons/webExtensionsApi';
import { getOptions } from '@commons/options';
import {
  newLocalizationBug,
  pontoonProjectTranslationView,
  pontoonSearchStringsWithStatus,
  pontoonTeam,
  pontoonTeamsProject,
} from '@commons/webLinks';
import * as UtilsApiModule from '@commons/utils';
import { getPontoonProjectForTheCurrentTab } from '@commons/backgroundMessaging';

import { TeamInfo } from '.';

jest.mock('@commons/webExtensionsApi');
jest.mock('@commons/options');
jest.mock('@commons/backgroundMessaging');

jest.spyOn(window, 'close').mockReturnValue(undefined);
const openNewPontoonTabSpy = jest
  .spyOn(UtilsApiModule, 'openNewPontoonTab')
  .mockResolvedValue({} as Tabs.Tab);

const team: StorageContent['team'] = {
  code: 'cs',
  name: 'Czech',
  bz_component: 'L10N/CS',
  strings: {
    approvedStrings: 0,
    pretranslatedStrings: 0,
    stringsWithWarnings: 0,
    stringsWithErrors: 0,
    missingStrings: 0,
    unreviewedStrings: 0,
    totalStrings: 0,
  },
};

const flush = () =>
  act(async () => {
    await flushPromises();
  });

(getPontoonProjectForTheCurrentTab as jest.Mock).mockResolvedValue(undefined);
(getFromStorage as jest.Mock).mockResolvedValue({
  team,
  latestTeamsActivity: {
    cs: {
      user: 'USER',
      date_iso: '1970-01-01T00:00:00Z',
    },
  },
});
(getOptions as jest.Mock).mockResolvedValue({
  locale_team: 'cs',
  pontoon_base_url: 'https://localhost',
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('TeamInfo', () => {
  it('renders', async () => {
    render(<TeamInfo />);
    await flush();

    expect(
      within(screen.getByRole('heading', { level: 3 })).getByTestId(
        'team-name',
      ),
    ).toHaveTextContent('Czech');
    expect(
      within(screen.getByRole('heading', { level: 3 })).getByTestId(
        'team-code',
      ),
    ).toHaveTextContent('cs');
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(8);
    expect(within(items[0]).getByTestId('label')).toHaveTextContent('Activity');
    expect(within(items[1]).getByTestId('label')).toHaveTextContent(
      'translated',
    );
    expect(within(items[2]).getByTestId('label')).toHaveTextContent(
      'pretranslated',
    );
    expect(within(items[3]).getByTestId('label')).toHaveTextContent('warnings');
    expect(within(items[4]).getByTestId('label')).toHaveTextContent('errors');
    expect(within(items[5]).getByTestId('label')).toHaveTextContent('missing');
    expect(within(items[6]).getByTestId('label')).toHaveTextContent(
      'unreviewed',
    );
    expect(within(items[7]).getByTestId('label')).toHaveTextContent(
      'all strings',
    );
  });

  it('renders without activity', async () => {
    (getFromStorage as jest.Mock).mockResolvedValue({
      team,
      latestTeamsActivity: {
        cs: {
          user: '',
          date_iso: undefined,
        },
      },
    });

    render(<TeamInfo />);
    await flush();

    expect(
      within(screen.getAllByRole('listitem')[0]).getByTestId('label'),
    ).toHaveTextContent('Activity');
    expect(
      within(screen.getAllByRole('listitem')[0]).getByTestId('value'),
    ).toHaveTextContent('―');
  });

  it('team page links work', async () => {
    render(<TeamInfo />);
    await flush();

    (
      await within(await screen.findByRole('heading', { level: 3 })).findByRole(
        'link',
      )
    ).click();
    await flushPromises();

    expect(openNewPontoonTabSpy).toHaveBeenCalledTimes(1);
    expect(openNewPontoonTabSpy).toHaveBeenLastCalledWith(
      pontoonTeam('https://localhost', team),
    );

    (await screen.findByText('Open Czech team page')).click();
    await flushPromises();

    expect(openNewPontoonTabSpy).toHaveBeenCalledTimes(2);
    expect(openNewPontoonTabSpy).toHaveBeenLastCalledWith(
      pontoonTeam('https://localhost', team),
    );
  });

  it('string status links work', async () => {
    render(<TeamInfo />);
    await flush();

    const statusLinks = await screen.findAllByRole('listitem');

    const expectedStatuses = [
      'translated',
      'pretranslated',
      'warnings',
      'errors',
      'missing',
      'unreviewed',
      'all',
    ];
    expect(statusLinks).toHaveLength(expectedStatuses.length + 1);

    for (const [index, status] of expectedStatuses.entries()) {
      await act(async () => {
        (await within(statusLinks[index + 1]).findByRole('link')).click();
        await flushPromises();
      });

      expect(openNewPontoonTabSpy).toHaveBeenLastCalledWith(
        pontoonSearchStringsWithStatus('https://localhost', team, status),
      );
    }
  });

  it('renders links for project in the current tab', async () => {
    const project = { name: 'Firefox', slug: 'firefox' };
    (getPontoonProjectForTheCurrentTab as jest.Mock).mockResolvedValue(project);
    (getActiveTab as jest.Mock).mockResolvedValue({
      url: 'https://firefox.com',
    });

    render(<TeamInfo />);
    await flush();

    (await screen.findByText('Open Firefox dashboard for Czech')).click();
    await flushPromises();

    expect(openNewPontoonTabSpy).toHaveBeenCalledTimes(1);
    expect(openNewPontoonTabSpy).toHaveBeenLastCalledWith(
      pontoonTeamsProject('https://localhost', team, project),
    );

    (
      await screen.findByText('Open Firefox translation view for Czech')
    ).click();

    expect(openNewPontoonTabSpy).toHaveBeenCalledTimes(2);
    expect(openNewPontoonTabSpy).toHaveBeenLastCalledWith(
      pontoonProjectTranslationView('https://localhost', team, project),
    );

    (
      await screen.findByRole('link', {
        name: 'Report bug for localization of Firefox to Czech',
      })
    ).click();
    await flushPromises();

    expect(openNewTab).toHaveBeenCalledTimes(1);
    expect(openNewTab).toHaveBeenLastCalledWith(
      newLocalizationBug({ team, url: 'https://firefox.com' }),
    );
  });
});
