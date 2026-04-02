/**
 * IndexedDB wrapper for photo storage
 * Photos are stored as blobs keyed by `stage-${stageId}`
 */

const DB_NAME = 'seventh-cipher-photos'
const DB_VERSION = 1
const STORE_NAME = 'photos'

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = (event) => resolve(event.target.result)
    request.onerror = (event) => reject(event.target.error)
  })
}

/**
 * Save a photo blob for a given stage
 * @param {number|string} stageId
 * @param {Blob} blob
 */
export async function savePhoto(stageId, blob) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const key = `stage-${stageId}`
    const request = store.put(blob, key)
    request.onsuccess = () => resolve()
    request.onerror = (event) => reject(event.target.error)
    tx.oncomplete = () => db.close()
  })
}

/**
 * Retrieve a photo blob for a given stage
 * @param {number|string} stageId
 * @returns {Promise<Blob|null>}
 */
export async function getPhoto(stageId) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const key = `stage-${stageId}`
    const request = store.get(key)
    request.onsuccess = (event) => resolve(event.target.result || null)
    request.onerror = (event) => reject(event.target.error)
    tx.oncomplete = () => db.close()
  })
}

/**
 * Retrieve all stored photos
 * @returns {Promise<{[key: string]: Blob}>}
 */
export async function getAllPhotos() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
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
