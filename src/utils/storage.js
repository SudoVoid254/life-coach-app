let db = null

const DB_NAME = 'LifeCoachDB'
const DB_VERSION = 1

// Initialize IndexedDB
export async function initializeDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = event.target.result

      // Create object stores
      const stores = ['habits', 'moods', 'journalEntries', 'feedItems']
      stores.forEach((store) => {
        if (!database.objectStoreNames.contains(store)) {
          database.createObjectStore(store, { keyPath: 'id' })
        }
      })
    }
  })
}

// Save data to IndexedDB
export async function saveToDB(storeName, data) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)

    // Clear existing data first
    store.clear()

    // Then add new data
    if (Array.isArray(data)) {
      data.forEach((item) => store.add(item))
    }

    transaction.onerror = () => reject(transaction.error)
    transaction.oncomplete = () => resolve()
  })
}

// Load data from IndexedDB
export async function loadFromDB(storeName) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// Delete from IndexedDB
export async function deleteFromDB(storeName) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    store.clear()

    transaction.onerror = () => reject(transaction.error)
    transaction.oncomplete = () => resolve()
  })
}

// Clear all data
export async function clearAllDB() {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    const transaction = db.transaction(['habits', 'moods', 'journalEntries', 'feedItems'], 'readwrite')
    transaction.objectStore('habits').clear()
    transaction.objectStore('moods').clear()
    transaction.objectStore('journalEntries').clear()
    transaction.objectStore('feedItems').clear()

    transaction.onerror = () => reject(transaction.error)
    transaction.oncomplete = () => resolve()
  })
}
