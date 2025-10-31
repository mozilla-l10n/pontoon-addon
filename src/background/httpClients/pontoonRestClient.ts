import { getOneOption } from '@commons/options';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface GetTeamInfoResponse {
  code: string;
  name: string;
  approved_strings: number;
  pretranslated_strings: number;
  strings_with_warnings: number;
  strings_with_errors: number;
  missing_strings: number;
  unreviewed_strings: number;
  total_strings: number;
}

export interface ProjectInfo {
  slug: string;
  name: string;
}

type GetProjectInfoResponse = ProjectInfo;

function getPontoonBaseUrl(): Promise<string> {
  return getOneOption('pontoon_base_url');
}

export const pontoonRestClient = {
  async getTeamInfo(locale_code: string): Promise<GetTeamInfoResponse> {
    const baseUrl = await getPontoonBaseUrl();
    const response = await fetch(`${baseUrl}/api/v2/locales/${locale_code}`);
    if (!response.ok) {
      const errorMessage = `Failed to fetch locale from Pontoon API: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }
    const team = await response.json();
    return team as GetTeamInfoResponse;
  },
  async getTeamsInfo(): Promise<GetTeamInfoResponse[]> {
    const teams: GetTeamInfoResponse[] = [];
    const baseUrl = await getPontoonBaseUrl();
    let url = `${baseUrl}/api/v2/locales/`;

    while (url) {
      const response = await fetch(url);
      if (!response.ok) {
        const errorMessage = `Failed to fetch locales from Pontoon API: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data: PaginatedResponse<GetTeamInfoResponse> =
        await response.json();
      teams.push(...data.results);
      if (!data.next) break;
      else url = data.next;
    }
    return teams;
  },
  async getProjectsInfo(): Promise<GetProjectInfoResponse[]> {
    const projects: GetProjectInfoResponse[] = [];
    const baseUrl = await getPontoonBaseUrl();
    let url = `${baseUrl}/api/v2/projects/`;

    while (url) {
      const response = await fetch(url);
      if (!response.ok) {
        const errorMessage = `Failed to fetch projects from Pontoon API: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data: PaginatedResponse<GetProjectInfoResponse> =
        await response.json();
      projects.push(...data.results);
      if (!data.next) break;
      else url = data.next;
    }
    return projects;
  },
};
