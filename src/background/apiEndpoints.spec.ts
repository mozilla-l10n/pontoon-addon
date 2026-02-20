import { bugzillaTeamComponents } from './apiEndpoints';

describe('apiEndpoints', () => {
  describe('bugzillaTeamComponents', () => {
    it('returns the mozilla-l10n-query bugzilla product URL', () => {
      expect(bugzillaTeamComponents()).toBe(
        'https://mozilla-l10n.github.io/mozilla-l10n-query/?bugzilla=product',
      );
    });
  });
});
