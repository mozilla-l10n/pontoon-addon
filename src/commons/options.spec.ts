/* eslint-disable jest/expect-expect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'jest-webextension-mock';
import { browser } from './webExtensionsApi';
import {
  getOneOption,
  getOptions,
  resetDefaultOptions,
  setOption,
} from './options';
import { defaultOptionsFor } from './data/defaultOptions';

const mockBrowser =
  (browser as any) ||
  (globalThis as any).mockBrowser ||
  (globalThis as any).browser ||
  {};

jest.mock('@commons/webExtensionsApi/browser');
jest.mock('@commons/data/defaultOptions');

(defaultOptionsFor as jest.Mock).mockImplementation(() => ({
  locale_team: 'en',
}));

beforeEach(() => {
  mockBrowser.runtime = mockBrowser.runtime || {};
  mockBrowser.runtime.getURL =
    mockBrowser.runtime.getURL && (mockBrowser.runtime.getURL as any).mock
      ? (mockBrowser.runtime.getURL as jest.Mock).mockReturnValue(
          'moz-extension://',
        ) && (mockBrowser.runtime.getURL as jest.Mock)
      : (globalThis as any).jest
        ? (globalThis as any).jest.fn().mockReturnValue('moz-extension://')
        : () => 'moz-extension://';
});

describe('options', () => {
  it('setOption', async () => {
    (mockBrowser.storage.local.set as jest.Mock).mockResolvedValue(undefined);

    await setOption('locale_team', 'cs');
    expect(mockBrowser.storage.local.set).toHaveBeenCalledWith({
      'options.locale_team': 'cs',
    });
  });

  it('getOptions', async () => {
    (mockBrowser.storage.local.get as jest.Mock).mockResolvedValue({
      'options.locale_team': 'cs',
    });

    const { locale_team } = await getOptions(['locale_team']);

    expect(mockBrowser.storage.local.get).toHaveBeenCalledWith([
      'options.locale_team',
    ]);
    expect(locale_team).toBe('cs');
  });

  it('getOptions loads default', async () => {
    (mockBrowser.storage.local.get as jest.Mock).mockResolvedValue({});

    const { locale_team } = await getOptions(['locale_team']);

    expect(mockBrowser.storage.local.get).toHaveBeenCalledWith([
      'options.locale_team',
    ]);
    expect(locale_team).toBe('en');
  });

  it('getOneOption', async () => {
    (mockBrowser.storage.local.get as jest.Mock).mockResolvedValue({
      'options.locale_team': 'cs',
    });

    const locale_team = await getOneOption('locale_team');

    expect(mockBrowser.storage.local.get).toHaveBeenCalledWith([
      'options.locale_team',
    ]);
    expect(locale_team).toBe('cs');
  });

  it('getOneOption loads default', async () => {
    (mockBrowser.storage.local.get as jest.Mock).mockResolvedValue({});

    const locale_team = await getOneOption('locale_team');

    expect(mockBrowser.storage.local.get).toHaveBeenCalledWith([
      'options.locale_team',
    ]);
    expect(locale_team).toBe('en');
  });

  it('resetDefaultOptions', async () => {
    (mockBrowser.storage.local.set as jest.Mock).mockResolvedValue(undefined);

    await resetDefaultOptions();
    expect(mockBrowser.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({ 'options.locale_team': 'en' }),
    );
  });
});
