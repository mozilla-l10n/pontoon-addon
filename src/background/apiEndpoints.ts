import { default as URITemplate } from 'urijs/src/URITemplate';

export const AUTOMATION_UTM_SOURCE = 'pontoon-addon-automation';

export function pontoonUserData(baseUrl: string): string {
  // without the trailing slash Pontoon returns 301
  return URITemplate('{+baseUrl}{/path*}/{?q*}')
    .expand({
      baseUrl,
      path: ['user-data'],
      q: {
        utm_source: AUTOMATION_UTM_SOURCE,
      },
    })
    .toString();
}

export function markAllNotificationsAsRead(baseUrl: string): string {
  // without the trailing slash Pontoon returns 301
  return URITemplate('{+baseUrl}{/path*}/{?q*}')
    .expand({
      baseUrl,
      path: ['notifications', 'mark-all-as-read'],
      q: {
        utm_source: AUTOMATION_UTM_SOURCE,
      },
    })
    .toString();
}

export function bugzillaTeamComponents(): string {
  // Link directly to the pre-generated JSON. The '?bugzilla=product' query on
  // the site root only redirects here via client side JavaScript, which fetch()
  // does not execute, so it would return the HTML page instead.
  return 'https://mozilla-l10n.github.io/mozilla-l10n-query/api/bugzilla/product.json';
}
