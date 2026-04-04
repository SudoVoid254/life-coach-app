import nacl from 'tweetnacl'
import { encode, decode } from 'js-base64'

// Generate a random encryption key (32 bytes for secret key)
// Uses Web Crypto API for secure random generation
export function generateKey() {
  const array = new Uint8Array(nacl.secretbox.keyLength)
  crypto.getRandomValues(array)
  return array
}

// Derive key from password using simple hashing (not production-grade, but sufficient for MVP)
export function deriveKeyFromPassword(password) {
  // For MVP, we'll use a simple approach
  // In production, use Argon2 or similar
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  return nacl.hash(data).slice(0, nacl.secretbox.keyLength)
}

// Encrypt data with a key
export function encryptData(data, key) {
  const nonce = nacl.utils.randomBytes(nacl.secretbox.nonceLength)
  const dataBytes = new TextEncoder().encode(JSON.stringify(data))
  const encrypted = nacl.secretbox(dataBytes, nonce, key)

  if (!encrypted) {
    throw new Error('Encryption failed')
  }

  // Combine nonce + encrypted data and encode as base64
  const combined = new Uint8Array(nonce.length + encrypted.length)
  combined.set(nonce)
  combined.set(encrypted, nonce.length)

  return encode(combined)
}

// Decrypt data with a key
export function decryptData(encryptedData, key) {
  try {
    const combined = new Uint8Array(decode(encryptedData))
    const nonce = combined.slice(0, nacl.secretbox.nonceLength)
    const box = combined.slice(nacl.secretbox.nonceLength)

    const decrypted = nacl.secretbox.open(box, nonce, key)

    if (!decrypted) {
      throw new Error('Decryption failed - invalid key or corrupted data')
    }

    const text = new TextDecoder().decode(decrypted)
    return JSON.parse(text)
  } catch (err) {
    throw new Error(`Decryption error: ${err.message}`)
  }
}

// Convert key to/from base64 for storage
export function keyToBase64(key) {
  return encode(new Uint8Array(key))
}

export function base64ToKey(b64) {
  return new Uint8Array(decode(b64))
}
