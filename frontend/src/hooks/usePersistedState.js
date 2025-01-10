import { useState, useEffect } from 'react';

const usePersistedState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      // For screenshots array, only store the last 10 items to prevent quota issues
      let valueToStore = state;
      if (key === 'screenshots' && Array.isArray(state)) {
        valueToStore = state.slice(-10); // Only keep last 10 screenshots
      }
      
      const serializedValue = JSON.stringify(valueToStore);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      // If quota is exceeded, try clearing old screenshots
      if (error.name === 'QuotaExceededError') {
        try {
          localStorage.removeItem('screenshots'); // Clear screenshots storage
          if (key !== 'screenshots') { // If not screenshots, try saving again
            localStorage.setItem(key, JSON.stringify(state));
          }
        } catch (retryError) {
          console.error('Error saving to localStorage after retry:', retryError);
        }
      } else {
        console.error('Error saving to localStorage:', error);
      }
    }
  }, [key, state]);

  return [state, setState];
};

export default usePersistedState;