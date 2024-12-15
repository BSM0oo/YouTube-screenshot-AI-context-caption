// Get the current hostname (IP or localhost) from the browser
const hostname = window.location.hostname;
export const API_BASE_URL = `http://${hostname}:8000`;
