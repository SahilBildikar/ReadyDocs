import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('readydocs_lang');
      return saved === 'hi' || saved === 'mr' || saved === 'en' ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const [isSeniorMode, setIsSeniorMode] = useState(() => {
    try {
      return localStorage.getItem('readydocs_senior_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Apply or remove senior-mode class on body
  useEffect(() => {
    if (isSeniorMode) {
      document.body.classList.add('senior-mode');
    } else {
      document.body.classList.remove('senior-mode');
    }
    try {
      localStorage.setItem('readydocs_senior_mode', String(isSeniorMode));
    } catch (_) {}
  }, [isSeniorMode]);

  const setLanguage = (lang) => {
    if (lang === 'en' || lang === 'hi' || lang === 'mr') {
      setLanguageState(lang);
      try {
        localStorage.setItem('readydocs_lang', lang);
      } catch (_) {}
    }
  };

  const toggleSeniorMode = () => {
    setIsSeniorMode((prev) => !prev);
  };

  /**
   * Translate key into current language with fallback to English
   * Supports parameter interpolation, e.g.:
   * t('questionCounter', { current: 1, total: 4 })
   * or t('questionCounter', 'Question {current} of {total}', { current: 1, total: 4 })
   */
  const t = (key, fallback = '', params = {}) => {
    let actualFallback = fallback;
    let actualParams = params;
    if (typeof fallback === 'object' && fallback !== null) {
      actualParams = fallback;
      actualFallback = '';
    }

    const dict = translations[language] || translations.en;
    let str = (dict && dict[key]) || (translations.en && translations.en[key]) || actualFallback || key;

    if (typeof str === 'string' && actualParams && typeof actualParams === 'object') {
      Object.keys(actualParams).forEach((pKey) => {
        str = str.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(actualParams[pKey]));
      });
    }

    return str;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        isSeniorMode,
        toggleSeniorMode,
        t
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
