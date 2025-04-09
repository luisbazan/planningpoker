const DB_NAME = 'planningPokerDB';
const STORE_NAME = 'browserId';
const ID_KEY = 'browserId';

export async function getBrowserId(): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(ID_KEY);

      getRequest.onerror = () => reject(getRequest.error);
      getRequest.onsuccess = () => {
        if (getRequest.result) {
          resolve(getRequest.result);
        } else {
          const newId = crypto.randomUUID();
          const writeTransaction = db.transaction(STORE_NAME, 'readwrite');
          const writeStore = writeTransaction.objectStore(STORE_NAME);
          writeStore.put(newId, ID_KEY);
          resolve(newId);
        }
      };
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
} 