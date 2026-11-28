/** Google Consent Mode v2 defaults (issue #12, PRD Q20). */
export const CONSENT_DEFAULTS = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500,
} as const;

export type ConsentState = 'granted' | 'denied';
