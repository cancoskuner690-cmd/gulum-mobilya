import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, getTranslation } from '../i18n/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('gul-mobilya-lang') || 'fr';
  });

  useEffect(() => {
    localStorage.setItem('gul-mobilya-lang', language);
  }, [language]);

  const t = (path) => getTranslation(language, path);

  const getProductField = (product, field) => {
    const fieldMap = {
      name: `name_${language}`,
      description: `description_${language}`
    };
    return product?.[fieldMap[field]] || product?.[`${field}_fr`] || '';
  };

  const getCategoryField = (category, field) => {
    const fieldMap = {
      name: `name_${language}`
    };
    return category?.[fieldMap[field]] || category?.[`${field}_fr`] || '';
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      getProductField,
      getCategoryField,
      languages: ['fr', 'tr', 'en'] 
    }}>
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
