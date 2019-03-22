import React from 'react';

import { useTheme } from '../utils/theming';

export default function IconButton({ label, iconName, onClick, extraStyle = {} }) {
  const { currentStyle } = useTheme();

  return (
    <button className={currentStyle.iconButton} style={extraStyle} onClick={onClick} aria-label={label}>
      <i className={['fas', 'fa-' + iconName].join(' ')}></i>
    </button>
  );
}
