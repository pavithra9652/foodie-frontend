// src/config.js
export const API_URL = (() => {
    if (typeof import.meta !== 'undefined') {
      return import.meta.env.DEV
        ? '/api'
        : import.meta.env.VITE_API_URL || '/api';
    }
    return '/api';
  })();
  