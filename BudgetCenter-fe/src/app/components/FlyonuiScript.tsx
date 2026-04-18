// FlyonuiScript.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Optional third-party libraries
import _ from 'lodash';
import noUiSlider from 'nouislider';

async function loadFlyonUI() {
  return import('flyonui/flyonui');
}

export default function FlyonuiScript() {
  const path = usePathname();

  useEffect(() => {
    const initFlyonUI = async () => {
      window._ = _;
      window.noUiSlider = noUiSlider as any;
      await loadFlyonUI();
    };

    initFlyonUI();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (
        window.HSStaticMethods &&
        typeof window.HSStaticMethods.autoInit === 'function'
      ) {
        window.HSStaticMethods.autoInit();
      }
    }, 100);
  }, [path]);

  return null;
}