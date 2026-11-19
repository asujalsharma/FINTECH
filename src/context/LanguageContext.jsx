import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  initLanguageService,
  setAppLanguage,
  subscribeLanguageChange,
  getLanguageInfo,
  SUPPORTED_LANGUAGES,
  t as dictionaryTranslate,
  translateText,
  translateBatch,
} from '../services/languageService';

const LanguageContext = createContext({
  currentLanguage: 'en',
  languageInfo: SUPPORTED_LANGUAGES[0],
  languages: SUPPORTED_LANGUAGES,
  setLanguage: async () => {},
  t: () => '',
  translate: async () => '',
  translateBatch: async () => [],
  openLanguageSelector: () => {},
  closeLanguageSelector: () => {},
});

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLangState] = useState('en');

  // Initialize language on mount
  useEffect(() => {
    let mounted = true;
    initLanguageService().then(lang => {
      if (mounted) {
        setCurrentLangState(lang || 'en');
      }
    });

    const unsubscribe = subscribeLanguageChange(newLang => {
      if (mounted) {
        setCurrentLangState(newLang || 'en');
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const handleSetLanguage = useCallback(async (code) => {
    const updated = await setAppLanguage(code);
    setCurrentLangState(updated || 'en');
  }, []);

  const openLanguageSelector = useCallback(() => {}, []);

  const closeLanguageSelector = useCallback(() => {}, []);

  // Quick dictionary translation helper (defaults to English)
  const t = useCallback(
    (key, fallback = '') => {
      return dictionaryTranslate(key, fallback, currentLanguage);
    },
    [currentLanguage],
  );

  // Live online translation API helper
  const translate = useCallback(
    async (text, targetLang = currentLanguage) => {
      return translateText(text, targetLang);
    },
    [currentLanguage],
  );

  const languageInfo = useMemo(() => {
    return getLanguageInfo(currentLanguage);
  }, [currentLanguage]);

  const value = useMemo(
    () => ({
      currentLanguage,
      languageInfo,
      languages: SUPPORTED_LANGUAGES,
      setLanguage: handleSetLanguage,
      t,
      translate,
      translateBatch,
      openLanguageSelector,
      closeLanguageSelector,
    }),
    [currentLanguage, languageInfo, handleSetLanguage, t, translate, openLanguageSelector, closeLanguageSelector],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
