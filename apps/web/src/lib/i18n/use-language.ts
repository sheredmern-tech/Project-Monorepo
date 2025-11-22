// ============================================================================
// FILE: lib/i18n/use-language.ts
// Hook for getting and changing language
// ============================================================================
'use client';

import { useEffect, useState } from 'react';
import i18next from 'i18next';
import Cookies from 'js-cookie';
import { type Language, cookieName, languages } from './settings';

export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    // Get language from cookie or default to 'id'
    const cookieLang = Cookies.get(cookieName);
    return (cookieLang as Language) || 'id';
  });

  useEffect(() => {
    // Listen for language changes
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng as Language);
    };

    i18next.on('languageChanged', handleLanguageChange);

    return () => {
      i18next.off('languageChanged', handleLanguageChange);
    };
  }, []);

  const changeLanguage = async (lng: Language) => {
    try {
      await i18next.changeLanguage(lng);

      // Save to cookie
      Cookies.set(cookieName, lng, {
        expires: 365, // 1 year
        path: '/',
        sameSite: 'strict',
      });

      setCurrentLanguage(lng);

      // Reload page to apply language change everywhere
      window.location.reload();
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return {
    currentLanguage,
    changeLanguage,
    languages: languages as readonly Language[],
  };
}
