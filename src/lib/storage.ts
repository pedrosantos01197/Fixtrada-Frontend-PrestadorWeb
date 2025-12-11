// AsyncStorage compat layer using localStorage so we can keep await in the original code paths.
export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const value = localStorage.getItem(key);
      return value === null ? null : value;
    } catch (err) {
      console.error('storage.getItem error', err);
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      console.error('storage.setItem error', err);
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error('storage.removeItem error', err);
    }
  },
  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (err) {
      console.error('storage.clear error', err);
    }
  },
};
