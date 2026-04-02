// app/src/utils/photo-store.js

const DB_NAME = 'ducheng-photos'
const DB_VERSION = 2
const CITY_STORES = ['shanghai', 'nanjing', 'hangzhou', 'xian']

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      for (const cityId of CITY_STORES) {
        if (!db.objectStoreNames.contains(cityId)) {
          db.createObjectStore(cityId)
        }
      }
    }

    request.onsuccess = (event) => resolve(event.target.result)
    request.onerror = (event) => reject(event.target.error)
  })
}

export async function savePhoto(cityId, stageId, blob) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(cityId, 'readwrite')
    const store = tx.objectStore(cityId)
    const key = `stage-${stageId}`
    const request = store.put(blob, key)
    request.onsuccess = () => resolve()
    request.onerror = (event) => reject(event.target.error)
    tx.oncomplete = () => db.close()
  })
}

export async function getPhoto(cityId, stageId) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(cityId, 'readonly')
    const store = tx.objectStore(cityId)
    const key = `stage-${stageId}`
    const request = store.get(key)
    request.onsuccess = (event) => resolve(event.target.result || null)
    request.onerror = (event) => reject(event.target.error)
    tx.oncomplete = () => db.close()
  })
}

export async function getAllPhotos(cityId) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(cityId, 'readonly')
    const store = tx.objectStore(cityId)
    const result = {}
    const cursorRequest = store.openCursor()

    cursorRequest.onsuccess = (event) => {
      const cursor = event.target.result
      if (cursor) {
        result[cursor.key] = cursor.value
        cursor.continue()
      } else {
        resolve(result)
      }
    }

    cursorRequest.onerror = (event) => reject(event.target.error)
    tx.oncomplete = () => db.close()
  })
}
