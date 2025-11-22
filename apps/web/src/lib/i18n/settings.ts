// ============================================================================
// FILE: lib/i18n/settings.ts
// i18n configuration settings
// ============================================================================

export const fallbackLng = 'id'; // Default language: Indonesian
export const languages = ['id', 'en'] as const; // Supported languages
export type Language = typeof languages[number];

export const defaultNS = 'common';
export const cookieName = 'i18next';

export function getOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    // debug: true,
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  };
}
