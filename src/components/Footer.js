import React from 'react';

import { useTheme } from '../utils/theming';

export default React.memo(function Footer() {
  const { currentStyle } = useTheme();

  return (
    <footer className={currentStyle.footer}>
      <p>Copyright © {new Date().getFullYear()} Cyandev</p>
    </footer>
  );
});
