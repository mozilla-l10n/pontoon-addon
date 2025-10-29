import { getOneOption } from '@commons/options';

interface GetTeamsInfoResponse {
  locales: Array<GetTeamInfoResponse>;
}

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

export interface GetProjectsInfoResponse {
  projects: Array<GetProjectInfoResponse>;
}

interface GetProjectInfoResponse {
  slug: string;
  name: string;
}

async function getPontoonBaseUrl(): Promise<string> {
  return await getOneOption('pontoon_base_url');
}

export const pontoonRestClient = {
  getTeamInfo: async (locale_code: string): Promise<GetTeamInfoResponse> => {
    const baseUrl = await getPontoonBaseUrl();
    const response = await fetch(`${baseUrl}/api/v2/locales/${locale_code}`);
    const team = await response.json();
    return team as GetTeamInfoResponse;
  },
  getTeamsInfo: async (): Promise<GetTeamsInfoResponse> => {
    const teams: GetTeamsInfoResponse = { locales: [] };
    const baseUrl = await getPontoonBaseUrl();
    let url = `${baseUrl}/api/v2/locales/`;

    while (url) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status}`);
      }

      const data: PaginatedResponse<GetTeamInfoResponse> =
        await response.json();
      teams.locales.push(...data.results);
      url = data.next || '';
    }
    return teams;
  },
  getProjectsInfo: async (): Promise<GetProjectsInfoResponse> => {
    const projects: GetProjectsInfoResponse = { projects: [] };
    const baseUrl = await getPontoonBaseUrl();
    let url = `${baseUrl}/api/v2/projects/`;

    while (url) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status}`);
      }

      const data: PaginatedResponse<GetProjectInfoResponse> =
        await response.json();
      projects.projects.push(...data.results);
      url = data.next || '';
    }
    return projects;
  },
};
