import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { Download, Upload, Trash2, Key } from 'lucide-react'
import { encryptData, decryptData, generateKey, keyToBase64, base64ToKey } from '../utils/encryption'

export default function Settings() {
  const { exportData, importData, clearAllData } = useAppStore()
  const [encryptionKey, setEncryptionKey] = useState(null)
  const [importError, setImportError] = useState(null)
  const [showKey, setShowKey] = useState(false)

  // Export data as JSON file
  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `life-coach-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Import data from JSON file
  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result)
        
        // If encrypted, decrypt first
        if (data.encrypted && encryptionKey) {
          const decrypted = decryptData(data.data, encryptionKey)
          await importData(decrypted)
        } else {
          await importData(data)
        }
        
        setImportError(null)
        alert('Data imported successfully! 🎉')
      } catch (err) {
        setImportError(err.message)
        alert(`Import failed: ${err.message}`)
      }
    }
    reader.readAsText(file)
  }

  // Generate encryption key
  const handleGenerateKey = () => {
    const key = generateKey()
    const keyB64 = keyToBase64(key)
    setEncryptionKey(keyB64)
    
    // Show key to user (they should save it!)
    alert(
      `🔐 Your encryption key has been generated!\n\n` +
      `SAVE THIS KEY - you'll need it to decrypt your data:\n\n${keyB64}\n\n` +
      `⚠️ Store this somewhere safe (password manager, secure note, etc.). ` +
      `If you lose it, your encrypted data is gone forever.`
    )
  }

  // Clear all data
  const handleClearAll = async () => {
    if (confirm('⚠️ This will delete ALL your data permanently. Are you sure?')) {
      if (confirm('Really sure? This cannot be undone.')) {
        await clearAllData()
        alert('All data cleared.')
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Settings ⚙️</h2>

      {/* Export/Import */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
        <h3 className="text-xl font-semibold mb-4">Backup & Restore</h3>
        <p className="text-slate-400 text-sm mb-4">
          Export your data as a JSON file for backup, or import a previous backup.
        </p>
        
        <div className="flex gap-4">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition"
          >
            <Download size={18} />
            Export Data
          </button>
          
          <label className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded transition cursor-pointer">
            <Upload size={18} />
            Import Data
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>

        {importError && (
          <p className="text-red-400 text-sm mt-4">Import error: {importError}</p>
        )}
      </div>

      {/* Encryption */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
        <h3 className="text-xl font-semibold mb-4">Encryption 🔐</h3>
        <p className="text-slate-400 text-sm mb-4">
          Generate an encryption key to encrypt your backup files. 
          Your data is always stored encrypted in the browser, but exports are plain JSON by default.
        </p>

        <button
          onClick={handleGenerateKey}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition"
        >
          <Key size={18} />
          Generate Encryption Key
        </button>

        {encryptionKey && (
          <div className="mt-4 p-4 bg-slate-900 rounded border border-slate-700">
            <p className="text-xs text-slate-400 mb-2">Current session key:</p>
            <code className="text-xs text-green-400 break-all">
              {showKey ? encryptionKey : '••••••••••••••••••••••••'}
            </code>
            <button
              onClick={() => setShowKey(!showKey)}
              className="text-xs text-purple-400 ml-2 hover:text-purple-300"
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-slate-800 rounded-lg p-6 border border-red-900/50 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-red-400">Danger Zone ⚠️</h3>
        <p className="text-slate-400 text-sm mb-4">
          Permanently delete all your data from this browser. This cannot be undone.
        </p>
        
        <button
          onClick={handleClearAll}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
        >
          <Trash2 size={18} />
          Clear All Data
        </button>
      </div>

      {/* Info */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-2">About</h3>
        <p className="text-slate-400 text-sm">
          <strong>Life Coach App</strong> v0.0.0<br />
          Privacy-first personal development tool<br />
          All data stored locally in your browser<br />
          MIT Licensed — Open Source
        </p>
        <p className="text-slate-500 text-xs mt-4">
          GitHub: <a href="https://github.com/SudoVoid254/life-coach-app" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">SudoVoid254/life-coach-app</a>
        </p>
      </div>
    </div>
  )
}
