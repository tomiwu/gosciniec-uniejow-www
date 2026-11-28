import type { CookieConsentConfig } from 'vanilla-cookieconsent';

export const CONSENT_COOKIE_NAME = 'cc_cookie';
import { applyAnalyticsConsent } from '@/lib/consent/analytics';
import { ga4MeasurementId, hasGa4 } from '@/lib/consent/ga4';

const POLISH: CookieConsentConfig['language'] = {
  default: 'pl',
  translations: {
    pl: {
      consentModal: {
        title: 'Szanujemy Twoją prywatność',
        description:
          'Używamy plików cookie, by strona działała. Cookie analityczne włączamy tylko za Twoją zgodą.',
        acceptAllBtn: 'Akceptuję wszystkie',
        acceptNecessaryBtn: 'Odrzucam',
        showPreferencesBtn: 'Ustawienia',
      },
      preferencesModal: {
        title: 'Ustawienia cookies',
        acceptAllBtn: 'Akceptuję wszystkie',
        acceptNecessaryBtn: 'Odrzucam',
        savePreferencesBtn: 'Zapisz wybór',
        closeIconLabel: 'Zamknij',
        sections: [
          {
            title: 'Niezbędne',
            description:
              'Te pliki cookie są wymagane do działania strony i nie można ich wyłączyć.',
            linkedCategory: 'necessary',
          },
          ...(hasGa4
            ? [
                {
                  title: 'Analityka',
                  description:
                    'Google Analytics 4 mierzy ruch na stronie po wyrażeniu zgody. Dane są zbierane zgodnie z Consent Mode.',
                  linkedCategory: 'analytics',
                },
              ]
            : []),
        ],
      },
    },
  },
};

function syncAnalytics(accepted: boolean): void {
  if (!hasGa4) return;
  applyAnalyticsConsent(accepted, ga4MeasurementId);
}

/** Config for vanilla-cookieconsent 3.3.0 (bundled; no CDN). */
export function buildCookieConsentConfig(): CookieConsentConfig {
  const categories: CookieConsentConfig['categories'] = {
    necessary: {
      readOnly: true,
    },
  };
  if (hasGa4) {
    categories['analytics'] = {};
  }

  return {
    mode: 'opt-in',
    autoShow: true,
    lazyHtmlGeneration: true,
    disablePageInteraction: false,
    hideFromBots: false,
    manageScriptTags: false,
    guiOptions: {
      consentModal: {
        layout: 'bar',
        position: 'bottom',
        equalWeightButtons: true,
      },
      preferencesModal: {
        equalWeightButtons: true,
      },
    },
    categories,
    language: POLISH,
    onConsent: ({ cookie }) => {
      syncAnalytics(cookie.categories.includes('analytics'));
    },
    onChange: ({ cookie, changedCategories }) => {
      if (!changedCategories.includes('analytics')) return;
      syncAnalytics(cookie.categories.includes('analytics'));
    },
  };
}
