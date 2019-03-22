import React from 'react';

import { useTheme } from '../utils/theming';

export default function Title({ text, level = 1 }) {
  const { currentStyle } = useTheme();

  if (level === 2) {
    return <h2 className={currentStyle.title}>{text}</h2>;
  } else if (level === 3) {
    return <h3 className={currentStyle.title}>{text}</h3>;
  } else if (level === 4) {
    return <h4 className={currentStyle.title}>{text}</h4>;
  }
  return <h1 className={currentStyle.title}>{text}</h1>;
}
