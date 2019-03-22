import React from 'react';
import { Link } from 'gatsby';

import { useI18N } from '../utils/i18N';
import { useTheme } from '../utils/theming';

export default React.memo(function Links(props) {
  const { currentStyle } = useTheme();
  const { currentLang } = useI18N();

  return (
    <div className={currentStyle.otherLinks}>
      <p>{useI18N('otherLinks')}</p>
      {
        props.links.map(link => (
          <div key={link.slug} className={currentStyle.links}>
            <Link to={link.slug}>{link.titles[currentLang]}</Link>
          </div>
        ))
      }
    </div>
  );
});
