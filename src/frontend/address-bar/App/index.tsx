import React, { useEffect, useState } from 'react';

import type { OptionsContent } from '@commons/data/defaultOptions';
import type { StorageContent } from '@commons/webExtensionsApi';
import {
  getActiveTab,
  getOneFromStorage,
  openNewTab,
} from '@commons/webExtensionsApi';
import { getOneOption } from '@commons/options';
import {
  newLocalizationBug,
  pontoonProjectTranslationView,
  pontoonTeamsProject,
} from '@commons/webLinks';
import { getPontoonProjectForTheCurrentTab } from '@commons/backgroundMessaging';
import { openNewPontoonTab } from '@commons/utils';

import { PanelSection } from '../PanelSection';

export const App: React.FC = () => {
  const [project, setProject] =
    useState<StorageContent['projectsList'][string]>();
  const [team, setTeam] = useState<StorageContent['team']>();
  const [pontoonBaseUrl, setPontoonBaseUrl] =
    useState<OptionsContent['pontoon_base_url']>();

  useEffect(() => {
    (async () => {
      const [projectForCurrentTab, team, pontoon_base_url] = await Promise.all([
        getPontoonProjectForTheCurrentTab(),
        getOneFromStorage('team'),
        getOneOption('pontoon_base_url'),
      ]);
      setProject(projectForCurrentTab);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      setTeam(team!);
      setPontoonBaseUrl(pontoon_base_url);
    })();
  }, []);

  return project && team && pontoonBaseUrl ? (
    <PanelSection
      items={[
        {
          text: `Open ${project.name} dashboard for ${team.name}`,
          onClick: () =>
            openNewPontoonTab(
              pontoonTeamsProject(pontoonBaseUrl, team, project),
            ),
        },
        {
          text: `Open ${project.name} translation view for ${team.name}`,
          onClick: () =>
            openNewPontoonTab(
              pontoonProjectTranslationView(pontoonBaseUrl, team, project),
            ),
        },
        {
          text: `Report bug for localization of ${project.name} to ${team.name}`,
          onClick: async () =>
            openNewTab(
              newLocalizationBug({
                team,
                url: (await getActiveTab()).url,
              }),
            ),
        },
      ]}
    />
  ) : (
    <></>
  );
};
