import React, { createContext, useState, useEffect, useContext } from 'react';

import { setPref, getPref } from './globalPrefs';

import * as defaultStyle from '../components/styles.module.css';
import * as darkStyle from '../components/styles-dark.module.css';

defaultStyle.$$name = 'default';
darkStyle.$$name = 'dark';

function resolveStyle(name) {
  if (name === 'dark') {
    return darkStyle;
  } else {
    return defaultStyle;
  }
}

const ctx = createContext({});

export function ThemeScope(props) {
  const [currentStyle, setCurrentStyle] = useState(resolveStyle(getPref('uiStyle')));

  useEffect(() => {
    if (document.body.$$styleClassName) {
      document.body.classList.remove(document.body.$$styleClassName);
    }
    const className = currentStyle.$$name + '-theme';
    document.body.classList.add(className);
    document.body.$$styleClassName = className;
  }, [currentStyle]);

  function _setCurrentStyle(styleName) {
    setPref('uiStyle', styleName);
    setCurrentStyle(resolveStyle(styleName));
  }

  return (
    <ctx.Provider value={{ currentStyle, setCurrentStyle: _setCurrentStyle }}>
      {props.children}
    </ctx.Provider>
  );
}

export function useTheme() {
  return useContext(ctx);
}
