import { getOneOption } from '@commons/options';

import type { ProjectInfo } from './pontoonRestClient';
import { pontoonRestClient } from './pontoonRestClient';

jest.mock('@commons/options');

global.fetch = jest.fn();

const mockGetOneOption = getOneOption as jest.MockedFunction<
  typeof getOneOption
>;
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('pontoonRestClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetOneOption.mockResolvedValue('https://pontoon.example.com');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getTeamInfo', () => {
    const mockTeamData = {
      code: 'cs',
      name: 'Czech',
      approved_strings: 100,
      pretranslated_strings: 50,
      strings_with_warnings: 10,
      strings_with_errors: 5,
      missing_strings: 25,
      unreviewed_strings: 15,
      total_strings: 205,
    };

    it('should fetch team info successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTeamData),
      } as Response);

      const result = await pontoonRestClient.getTeamInfo('cs');

      expect(mockGetOneOption).toHaveBeenCalledWith('pontoon_base_url');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://pontoon.example.com/api/v2/locales/cs',
      );
      expect(result).toEqual(mockTeamData);
    });

    it('should throw error when API request fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(pontoonRestClient.getTeamInfo('blah')).rejects.toThrow(
        'Failed to fetch locale from Pontoon API: 404 Not Found',
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://pontoon.example.com/api/v2/locales/blah',
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(pontoonRestClient.getTeamInfo('cs')).rejects.toThrow(
        'Network error',
      );
    });

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response);

      await expect(pontoonRestClient.getTeamInfo('cs')).rejects.toThrow(
        'Invalid JSON',
      );
    });
  });

  describe('getTeamsInfo', () => {
    const mockTeam1 = {
      code: 'cs',
      name: 'Czech',
      approved_strings: 100,
      pretranslated_strings: 50,
      strings_with_warnings: 10,
      strings_with_errors: 5,
      missing_strings: 25,
      unreviewed_strings: 15,
      total_strings: 205,
    };

    const mockTeam2 = {
      code: 'de',
      name: 'German',
      approved_strings: 200,
      pretranslated_strings: 100,
      strings_with_warnings: 20,
      strings_with_errors: 10,
      missing_strings: 50,
      unreviewed_strings: 30,
      total_strings: 410,
    };

    it('should fetch all teams', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            count: 2,
            next: null,
            previous: null,
            results: [mockTeam1, mockTeam2],
          }),
      } as Response);

      const result = await pontoonRestClient.getTeamsInfo();

      expect(mockGetOneOption).toHaveBeenCalledWith('pontoon_base_url');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://pontoon.example.com/api/v2/locales/?fields=code,name,total_strings&page_size=1000',
      );
      expect(result).toEqual([mockTeam1, mockTeam2]);
    });

    it('should handle empty results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            count: 0,
            next: null,
            previous: null,
            results: [],
          }),
      } as Response);

      const result = await pontoonRestClient.getTeamsInfo();

      expect(result).toEqual([]);
    });

    it('should throw error when API request fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(pontoonRestClient.getTeamsInfo()).rejects.toThrow(
        'Failed to fetch locales from Pontoon API: 500 Internal Server Error',
      );
    });
  });

  describe('getProjectsInfo', () => {
    const mockProject1: ProjectInfo = {
      slug: 'firefox',
      name: 'Firefox',
    };

    const mockProject2: ProjectInfo = {
      slug: 'thunderbird',
      name: 'Thunderbird',
    };

    it('should fetch all projects', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            count: 2,
            next: null,
            previous: null,
            results: [mockProject1, mockProject2],
          }),
      } as Response);

      const result = await pontoonRestClient.getProjectsInfo();

      expect(mockGetOneOption).toHaveBeenCalledWith('pontoon_base_url');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://pontoon.example.com/api/v2/projects/?fields=slug,name&page_size=1000',
      );
      expect(result).toEqual([mockProject1, mockProject2]);
    });

    it('should handle empty results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            count: 0,
            next: null,
            previous: null,
            results: [],
          }),
      } as Response);

      const result = await pontoonRestClient.getProjectsInfo();

      expect(result).toEqual([]);
    });

    it('should throw error when API request fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response);

      await expect(pontoonRestClient.getProjectsInfo()).rejects.toThrow(
        'Failed to fetch projects from Pontoon API: 401 Unauthorized',
      );
    });
  });
});
