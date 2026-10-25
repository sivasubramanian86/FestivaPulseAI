import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, TranslationDictionary } from './types';
import { en } from './locales/en';
import { ta } from './locales/ta';
import { hi } from './locales/hi';
import { es } from './locales/es';

const dictionaries: Record<SupportedLanguage, TranslationDictionary> = {
  en,
  ta,
  hi,
  es,
};

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationDictionary;
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: en,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('festivapulse_lang');
    return (saved as SupportedLanguage) || 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('festivapulse_lang', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: dictionaries[language] || en,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
