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
   */
  const t = (key, fallback = '') => {
    const dict = translations[language] || translations.en;
    if (dict && dict[key]) {
      return dict[key];
    }
    const enDict = translations.en;
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    return fallback || key;
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
