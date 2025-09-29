import { getOneOption } from '@commons/options';

interface GetTeamsInfoResponse {
  locales: Array<{
    code: string;
    name: string;
    approved_strings: number;
    pretranslated_strings: number;
    strings_with_warnings: number;
    strings_with_errors: number;
    missing_strings: number;
    unreviewed_strings: number;
    total_strings: number;
  }>;
}

export interface GetProjectsInfoResponse {
  projects: Array<{
    slug: string;
    name: string;
  }>;
}

async function getPontoonBaseUrl(): Promise<string> {
  return await getOneOption('pontoon_base_url');
}

async function fetchPage(page: number) {
  const baseUrl = await getPontoonBaseUrl();
  const response = await fetch(`${baseUrl}/api/v2/locales/?page=${page}`);
  const jsonResponse = await response.json();

  return { locales: jsonResponse.results } as GetTeamsInfoResponse;
}

export const pontoonRestClient = {
  getTeamsInfo: async (): Promise<GetTeamsInfoResponse> => {
    let page = 1;
    let hasMore = true;
    const fullResponse: GetTeamsInfoResponse = { locales: [] };

    while (hasMore) {
      try {
        const data = await fetchPage(page);

        if (data.locales && data.locales.length > 0) {
          fullResponse.locales.push(...data.locales);
          page++;
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error(error);
        hasMore = false;
      }
    }

    return fullResponse as GetTeamsInfoResponse;
  },
  getProjectsInfo: async (): Promise<GetProjectsInfoResponse> => {
    let page = 1;
    let hasMore = true;
    const fullResponse: GetProjectsInfoResponse = { projects: [] };

    while (hasMore) {
      try {
        const baseUrl = await getPontoonBaseUrl();
        const response = await fetch(
          `${baseUrl}/api/v2/projects/?page=${page}`,
        );
        const jsonResponse = await response.json();

        const data = {
          projects: jsonResponse.results,
        } as GetProjectsInfoResponse;

        if (data.projects && data.projects.length > 0) {
          fullResponse.projects.push(...data.projects);
          page++;
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error(error);
        hasMore = false;
      }
    }

    return fullResponse as GetProjectsInfoResponse;
  },
};
