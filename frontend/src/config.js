// config.js
const getApiBaseUrl = () => {
  // Check if we're in mac_remote mode
  if (import.meta.env.VITE_DEPLOYMENT_ENV === 'mac_remote') {
    return 'https://youtubenotes.duckdns.org';
  }

  // Check if we're in production
  if (import.meta.env.PROD) {
    // Use relative path in production
    return '';
  }

  // Development mode - use network IP
  const networkHost = window.location.hostname;
  return `http://${networkHost}:8000`;
};

export const API_BASE_URL = getApiBaseUrl();

// Export full config object for additional settings
export const config = {
  apiBaseUrl: API_BASE_URL,
  apiEndpoint: `${API_BASE_URL}/api`,
};

export default config;