import React from 'react';

import { useTheme } from '../utils/theming';

export default function Paragraph({ children }) {
  const { currentStyle } = useTheme();

  return <p className={currentStyle.para}>{children}</p>;
}
