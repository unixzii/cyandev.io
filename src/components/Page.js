import React from 'react';

import { I18NScope } from '../utils/i18N';
import { ThemeScope } from '../utils/theming';
import createHOCFactory from '../utils/createHOCFactory';
import { page } from './styles.module.css';

import i18n from '../i18n.json';

export default function Page({ children }) {
  return (
    <I18NScope stringMap={i18n}>
      <ThemeScope>
        <div className={page}>{children}</div>
      </ThemeScope>
    </I18NScope>
  );
}

export const withPage = createHOCFactory(Component => {
  return function Wrapped(props) {
    return (
      <Page>
        <Component {...props} />
      </Page>
    );
  }
}, 'withPage');
