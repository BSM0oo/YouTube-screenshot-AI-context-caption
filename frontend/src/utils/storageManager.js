// Constants
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit
const CLEANUP_THRESHOLD = 0.9; // 90% of max storage
const STORAGE_KEY_PREFIX = 'yt-notes-';

/**
 * Utility class to manage localStorage with quota handling
 */
class StorageManager {
  /**
   * Calculate total storage usage
   * @returns {number} Total bytes used in localStorage
   */
  static getStorageUsage() {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        total += localStorage.getItem(key).length * 2; // UTF-16 uses 2 bytes per char
      }
    }
    return total;
  }

  /**
   * Check if storage quota would be exceeded
   * @param {string} value Content to be stored
   * @returns {boolean} True if quota would be exceeded
   */
  static wouldExceedQuota(value) {
    const currentUsage = this.getStorageUsage();
    const newItemSize = value.length * 2;
    return (currentUsage + newItemSize) > MAX_STORAGE_SIZE;
  }

  /**
   * Clean up old items if needed
   * @returns {boolean} True if cleanup was performed
   */
  static async cleanupIfNeeded() {
    const currentUsage = this.getStorageUsage();
    if (currentUsage > (MAX_STORAGE_SIZE * CLEANUP_THRESHOLD)) {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(STORAGE_KEY_PREFIX)) {
          try {
            const value = JSON.parse(localStorage.getItem(key));
            keys.push({
              key,
              time: value.timestamp || value.createdAt || 0
            });
          } catch (e) {
            console.warn('Failed to parse item:', key);
            keys.push({ key, time: 0 });
          }
        }
      }
      
      // Sort by timestamp and remove oldest items
      keys.sort((a, b) => a.time - b.time);
      for (const {key} of keys.slice(0, Math.ceil(keys.length * 0.3))) { // Remove oldest 30%
        localStorage.removeItem(key);
      }
      return true;
    }
    return false;
  }

  /**
   * Safely store data with quota management
   * @param {string} key Storage key
   * @param {any} data Data to store
   * @throws {Error} If storage fails after cleanup attempt
   */
  static async setItem(key, data) {
    const fullKey = `${STORAGE_KEY_PREFIX}${key}`;
    const value = JSON.stringify(data);
    
    try {
      localStorage.setItem(fullKey, value);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        // Try cleanup
        const cleaned = await this.cleanupIfNeeded();
        if (cleaned) {
          try {
            localStorage.setItem(fullKey, value);
            return;
          } catch (retryError) {
            throw new Error('Storage quota exceeded even after cleanup');
          }
        }
        throw new Error('Storage quota exceeded and cleanup not possible');
      }
      throw error;
    }
  }

  /**
   * Safely retrieve data
   * @param {string} key Storage key
   * @returns {any} Stored data or null if not found
   */
  static getItem(key) {
    const fullKey = `${STORAGE_KEY_PREFIX}${key}`;
    const value = localStorage.getItem(fullKey);
    return value ? JSON.parse(value) : null;
  }

  /**
   * Remove item from storage
   * @param {string} key Storage key
   */
  static removeItem(key) {
    const fullKey = `${STORAGE_KEY_PREFIX}${key}`;
    localStorage.removeItem(fullKey);
  }
}

export default StorageManager;