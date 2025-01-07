import { useState, useEffect, useCallback } from 'react';

const usePersistedState = (key, initialValue) => {
  // Try to get the persisted value from localStorage
  const getStoredValue = () => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return initialValue;
    }
  };

  const [state, setState] = useState(getStoredValue);

  // Memoized version of the save function
  const saveState = useCallback((value) => {
    try {
      // Save to localStorage
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key]);

  // Update localStorage when state changes
  useEffect(() => {
    saveState(state);
  }, [state, saveState]);

  // Handle visibility change events
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Save state when page is hidden
        saveState(state);
      } else if (document.visibilityState === 'visible') {
        // Restore state when page becomes visible
        setState(getStoredValue());
      }
    };

    // Handle page hide event (especially important for iOS Safari)
    const handlePageHide = () => {
      saveState(state);
    };

    // Handle before unload event
    const handleBeforeUnload = () => {
      saveState(state);
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state, saveState]);

  return [state, setState];
};

export default usePersistedState;