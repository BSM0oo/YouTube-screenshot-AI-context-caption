import { useState, useEffect, useCallback } from 'react';
import StorageManager from './storageManager';

/**
 * Custom hook for state that persists in localStorage with quota management
 * @param {string} key Storage key
 * @param {any} initialValue Initial state value
 * @returns {[any, Function]} State value and setter function
 */
function usePersistedState(key, initialValue) {
  // Initialize state with persisted value or initial value
  const [state, setState] = useState(() => {
    try {
      return StorageManager.getItem(key) ?? initialValue;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return initialValue;
    }
  });

  // Persist state changes to storage
  useEffect(() => {
    const saveState = async () => {
      try {
        await StorageManager.setItem(key, state);
      } catch (error) {
        console.error('Error setting localStorage key:', error);
        // Optionally show a user-friendly error message here
      }
    };
    saveState();
  }, [key, state]);

  // Create a safe setState wrapper
  const setPersistedState = useCallback(async (newValue) => {
    try {
      const value = typeof newValue === 'function' ? newValue(state) : newValue;
      setState(value);
    } catch (error) {
      console.error('Error updating persisted state:', error);
      // Optionally handle the error here (e.g., show user notification)
    }
  }, [state]);

  return [state, setPersistedState];
}

export default usePersistedState;