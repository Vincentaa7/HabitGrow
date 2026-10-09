// src/components/providers/ServiceWorkerRegister.tsx
'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('HabitGrow ServiceWorker active with scope:', registration.scope);
          })
          .catch((error) => {
            console.warn('HabitGrow ServiceWorker registration error:', error);
          });
      };

      // If document is already loaded/hydrated, register immediately without waiting
      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
        return () => window.removeEventListener('load', registerSW);
      }
    }
  }, []);

  return null;
}
