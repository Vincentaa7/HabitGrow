// src/components/providers/ServiceWorkerRegister.tsx
'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker as soon as page loads
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('HabitGrow ServiceWorker active with scope:', registration.scope);
          })
          .catch((error) => {
            console.warn('HabitGrow ServiceWorker registration error:', error);
          });
      });
    }
  }, []);

  return null;
}
