/**
 * Safe Local Storage Utility
 * Prevents QuotaExceededError and private browsing SecurityError exceptions.
 * Includes in-memory backup store and automatic cleanup of oversized cached items.
 */

const memoryStore = new Map<string, string>();

export const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch {
      // Ignored
    }
    return memoryStore.get(key) || null;
  },

  setItem(key: string, value: string): boolean {
    // Always keep memoryStore updated as synchronous in-memory backup
    memoryStore.set(key, value);

    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
        return true;
      }
    } catch (e: any) {
      // If QuotaExceededError, try evicting non-critical cache keys and retry once
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          const keysToEvict = [
            "tnpa_offline_members_backup",
            "tnpa_audit_logs_cache",
            "tnpa_jobs_data",
            "analytics_theme",
            "services_theme",
            "tnpa_restored_form_draft"
          ];
          for (const evictKey of keysToEvict) {
            if (evictKey !== key) {
              window.localStorage.removeItem(evictKey);
            }
          }
          window.localStorage.setItem(key, value);
          return true;
        }
      } catch (retryErr) {
        console.warn(`[SafeStorage] localStorage quota reached. Key '${key}' kept safely in memory store.`, retryErr);
      }
    }
    return false;
  },

  removeItem(key: string): void {
    memoryStore.delete(key);
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Ignored
    }
  },

  clear(): void {
    memoryStore.clear();
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.clear();
      }
    } catch {
      // Ignored
    }
  }
};
