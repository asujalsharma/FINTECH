import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  initLanguageService,
  getAppLanguage,
  setAppLanguage,
  subscribeLanguageChange,
  getLanguageInfo,
  SUPPORTED_LANGUAGES,
  t as dictionaryTranslate,
  translateText,
  translateBatch,
} from '../services/languageService';
import LanguageSelectorModal from '../components/LanguageSelectorModal';

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
  const [currentLanguage, setCurrentLangState] = useState(getAppLanguage());
  const [modalVisible, setModalVisible] = useState(false);

  // Initialize saved language on mount
  useEffect(() => {
    let mounted = true;
    initLanguageService().then(lang => {
      if (mounted) {
        setCurrentLangState(lang);
      }
    });

    const unsubscribe = subscribeLanguageChange(newLang => {
      if (mounted) {
        setCurrentLangState(newLang);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const handleSetLanguage = useCallback(async (code) => {
    const updated = await setAppLanguage(code);
    setCurrentLangState(updated);
    setModalVisible(false);
  }, []);

  const openLanguageSelector = useCallback(() => {
    setModalVisible(true);
  }, []);

  const closeLanguageSelector = useCallback(() => {
    setModalVisible(false);
  }, []);

  // Quick dictionary translation helper
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
      <LanguageSelectorModal
        visible={modalVisible}
        currentLanguage={currentLanguage}
        onSelectLanguage={handleSetLanguage}
        onClose={closeLanguageSelector}
      />
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
