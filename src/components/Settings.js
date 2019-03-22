import React, { useState, useEffect, useRef } from 'react';

import IconButton from '../components/IconButton';
import { useI18N } from '../utils/i18N';
import { useTheme } from '../utils/theming';

function useDismissBarrier(enabled, barrierRef, handler) {
  useEffect(() => {
    function onTap(e) {
      let current = e.target;
      while (current != null) {
        if (current === barrierRef.current) {
          return;
        }
        current = current.parentNode;
      }
      handler();
    }

    if (enabled) {
      document.addEventListener('touchstart', onTap, { capture: true });
      document.addEventListener('mousedown', onTap, { capture: true });
    }
    
    return () => {
      document.removeEventListener('touchstart', onTap);
      document.removeEventListener('mousedown', onTap);
    }
  }, [enabled]);
}

export default React.memo(function Settings() {
  const ref = useRef();
  const [collapsed, setCollapsed] = useState(true);
  
  const { currentLang, setCurrentLang } = useI18N();
  const { currentStyle, setCurrentStyle } = useTheme();

  useDismissBarrier(collapsed, ref, () => {
    setCollapsed(true);
  });

  function onExpandOrCollapse() {
    setCollapsed(!collapsed);
  }

  function onChangeLanguage() {
    if (currentLang === 'en') {
      setCurrentLang('zh');
    } else {
      setCurrentLang('en');
    }
  }

  function onChangeTheme() {
    if (currentStyle.$$name === 'default') {
      setCurrentStyle('dark');
    } else {
      setCurrentStyle('default');
    }
  }

  return (
    <div ref={ref} style={{ position: 'absolute', top: 0, right: 0 }}>
      <div
        style={{
          transition: collapsed ? 'all .5s' : 'all .3s',
          opacity: collapsed ? 1 : 0,
          transform: collapsed ? 'none' : 'translateY(80px)',
          pointerEvents: collapsed ? 'all' : 'none'
        }}>
        <IconButton
          iconName="cog"
          onClick={onExpandOrCollapse} 
          extraStyle={{
            transform: collapsed ? 'none' : 'rotateZ(-270deg)',
            transition: collapsed ? 'transform .6s' : 'transform .3s',
          }} />
      </div>
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          top: 0,
          transition: 'all .4s',
          opacity: collapsed ? 0 : 1,
          transform: collapsed ? 'translateY(-30px)' : 'none',
          pointerEvents: collapsed ? 'none' : 'all'
        }}>
        <IconButton
          iconName={currentLang === 'en' ? 'globe-asia' : 'globe-americas'}
          onClick={onChangeLanguage}
          extraStyle={{
            opacity: collapsed ? 0 : 1,
            transition: collapsed ? 'all .2s' : 'all .5s'
          }} />
        <IconButton
          iconName={currentStyle.$$name === 'default' ? 'moon' : 'sun'}
          onClick={onChangeTheme}
          extraStyle={{
            marginTop: '16px',
            transition: 'all .4s',
            transform: collapsed ? 'translateY(-40px)' : 'none'
          }} />
      </div>
    </div>
  );
});
