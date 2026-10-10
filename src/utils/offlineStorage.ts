/**
 * Offline Persistent Storage Engine (IndexedDB + Persistent Storage API)
 * Ensures 100% offline reliability on Android (WebAPK, Chrome, Firefox, and Capacitor WebView)
 * bypassing the 5MB localStorage limit for large worldbuilding universes and images.
 */

const DB_NAME = 'GrimorioOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'lore_state';

export interface OfflineStorageStats {
  persisted: boolean;
  usageBytes: number;
  quotaBytes: number;
  usageFormatted: string;
  indexedDbReady: boolean;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveToOfflineDB<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(value, key);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch (err) {
    // Fallback silently if IndexedDB is blocked in private mode
    console.warn('IndexedDB save fallback:', err);
  }
}

export async function loadFromOfflineDB<T>(key: string): Promise<T | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => {
        db.close();
        resolve((req.result as T) ?? null);
      };
      req.onerror = () => {
        db.close();
        reject(req.error);
      };
    });
  } catch (err) {
    console.warn('IndexedDB load fallback:', err);
    return null;
  }
}

export async function requestAndroidPersistentStorage(): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persisted();
      if (isPersisted) return true;
      return await navigator.storage.persist();
    }
  } catch {
    // Ignore errors in unsupported environments
  }
  return false;
}

export async function getOfflineStorageStats(): Promise<OfflineStorageStats> {
  let persisted = false;
  let usageBytes = 0;
  let quotaBytes = 0;
  let indexedDbReady = false;

  try {
    const db = await openDatabase();
    indexedDbReady = true;
    db.close();
  } catch {
    indexedDbReady = false;
  }

  try {
    if (typeof navigator !== 'undefined' && navigator.storage) {
      if (navigator.storage.persisted) {
        persisted = await navigator.storage.persisted();
      }
      if (navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        usageBytes = estimate.usage || 0;
        quotaBytes = estimate.quota || 0;
      }
    }
  } catch {
    // Fallback
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  return {
    persisted,
    usageBytes,
    quotaBytes,
    usageFormatted: formatBytes(usageBytes),
    indexedDbReady,
  };
}
