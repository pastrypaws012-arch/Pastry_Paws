/**
 * API configuration
 * Automatically uses Vite proxy in development ('')
 * or production backend URL when VITE_API_URL is configured (e.g. on Render)
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';
