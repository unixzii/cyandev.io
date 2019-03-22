import React, { createContext, useState, useContext } from 'react';

import { setPref, getPref } from './globalPrefs';

const ctx = createContext({});

export function I18NScope(props) {
  const [currentLang, setCurrentLang] = useState(getPref('lang') || 'en');

  function _setCurrentLang(lang) {
    setPref('lang', lang);
    setCurrentLang(lang);
  }

  return (
    <ctx.Provider
      value={{
        currentLang,
        setCurrentLang: _setCurrentLang,
        stringMap: props.stringMap }}>
      {props.children}
    </ctx.Provider>
  );
}

export function useI18N(key) {
  const { currentLang, setCurrentLang, stringMap } = useContext(ctx);
  if (key) {
    return ((stringMap || {})[currentLang] || {})[key] || key;
  }
  return { currentLang, setCurrentLang };
}
