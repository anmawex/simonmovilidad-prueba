/**
 * Local cache manager using IndexedDB or localStorage.
 * Used for offline data support and performance optimization.
 */

export const cache = {
  get: (key: string) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Cache read error:", error);
      return null;
    }
  },
  set: (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Cache write error:", error);
    }
  },
  remove: (key: string) => {
    localStorage.removeItem(key);
  },
};
