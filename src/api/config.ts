// src/config/api.ts (or wherever this file lives)

export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const fetchConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
};
