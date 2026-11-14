export interface MusicRecord {
  blob: Blob;
  name: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const req = indexedDB.open('soralab', 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains('kv')) {
        req.result.createObjectStore('kv');
      }
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

export async function getMusicRecord(): Promise<MusicRecord | undefined> {
  const db = await openDb();
  return new Promise((res, rej) => {
    const q = db.transaction('kv').objectStore('kv').get('music');
    q.onsuccess = () => res(q.result as MusicRecord | undefined);
    q.onerror = () => rej(q.error);
  });
}

export async function setMusicRecord(rec: MusicRecord): Promise<void> {
  const db = await openDb();
  return new Promise((res, rej) => {
    const q = db.transaction('kv', 'readwrite').objectStore('kv').put(rec, 'music');
    q.onsuccess = () => res();
    q.onerror = () => rej(q.error);
  });
}

export async function deleteMusicRecord(): Promise<void> {
  const db = await openDb();
  return new Promise((res, rej) => {
    const q = db.transaction('kv', 'readwrite').objectStore('kv').delete('music');
    q.onsuccess = () => res();
    q.onerror = () => rej(q.error);
  });
}
