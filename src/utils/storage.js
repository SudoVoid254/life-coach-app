import { encryptData, decryptData, generateKey, keyToBase64, base64ToKey } from './encryption'

let db = null
let encryptionKey = null

const DB_NAME = 'LifeCoachDB'
const DB_VERSION = 1
const KEY_STORE = 'encryptionKeys'

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
      const stores = ['habits', 'moods', 'journalEntries', 'feedItems', KEY_STORE]
      stores.forEach((store) => {
        if (!database.objectStoreNames.contains(store)) {
          database.createObjectStore(store, { keyPath: 'id' })
        }
      })
    }
  })
}

// Load encryption key from storage
export async function loadEncryptionKey() {
  if (!db) return null
  
  return new Promise((resolve) => {
    const transaction = db.transaction([KEY_STORE], 'readonly')
    const store = transaction.objectStore(KEY_STORE)
    const request = store.get('masterKey')
    
    request.onsuccess = () => {
      if (request.result) {
        encryptionKey = base64ToKey(request.result.key)
        resolve(encryptionKey)
      } else {
        resolve(null)
      }
    }
    
    request.onerror = () => resolve(null)
  })
}

// Save encryption key to storage
export async function saveEncryptionKey(key) {
  if (!db) return
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([KEY_STORE], 'readwrite')
    const store = transaction.objectStore(KEY_STORE)
    store.put({ id: 'masterKey', key: keyToBase64(key) })
    
    transaction.oncomplete = () => {
      encryptionKey = key
      resolve()
    }
    
    transaction.onerror = () => reject(transaction.error)
  })
}

// Check if encryption is enabled
export function isEncryptionEnabled() {
  return encryptionKey !== null
}

// Save data to IndexedDB (with optional encryption)
export async function saveToDB(storeName, data, encrypt = false) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)

    // Clear existing data first
    store.clear()

    // Then add new data (encrypt if requested and key exists)
    if (Array.isArray(data)) {
      data.forEach((item) => {
        const itemToStore = encrypt && encryptionKey ? encryptData(item, encryptionKey) : item
        store.add(itemToStore)
      })
    }

    transaction.onerror = () => reject(transaction.error)
    transaction.oncomplete = () => resolve()
  })
}

// Load data from IndexedDB (with optional decryption)
export async function loadFromDB(storeName, decrypt = false) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      let result = request.result
      
      // Decrypt if requested and key exists
      if (decrypt && encryptionKey && Array.isArray(result)) {
        try {
          result = result.map((item) => {
            // Check if item is encrypted (will be a string if encrypted)
            if (typeof item === 'string') {
              return decryptData(item, encryptionKey)
            }
            return item
          })
        } catch (err) {
          console.error('Decryption failed:', err)
          // Return raw data if decryption fails
        }
      }
      
      resolve(result)
    }
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

    const transaction = db.transaction(['habits', 'moods', 'journalEntries', 'feedItems', KEY_STORE], 'readwrite')
    transaction.objectStore('habits').clear()
    transaction.objectStore('moods').clear()
    transaction.objectStore('journalEntries').clear()
    transaction.objectStore('feedItems').clear()
    transaction.objectStore(KEY_STORE).clear()

    transaction.onerror = () => reject(transaction.error)
    transaction.oncomplete = () => {
      encryptionKey = null
      resolve()
    }
  })
}
