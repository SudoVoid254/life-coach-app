import { useState, useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { Trash2, ArrowLeft } from 'lucide-react'
import { formatDateTime, formatDate } from '../utils/dateHelpers'

export default function Journal() {
  const { journalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useAppStore()
  const [view, setView] = useState('list') // 'list' or 'editor'
  const [currentEntry, setCurrentEntry] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [editorContent, setEditorContent] = useState('')

  const handleNewEntry = () => {
    setCurrentEntry(null)
    setEditorContent('')
    setView('editor')
  }

  const handleEditEntry = (entry) => {
    setCurrentEntry(entry)
    setEditorContent(entry.content)
    setView('editor')
  }

  const handleSaveEntry = () => {
    if (!editorContent.trim()) {
      alert('Entry cannot be empty')
      return
    }

    if (currentEntry) {
      updateJournalEntry(currentEntry.id, { content: editorContent })
    } else {
      addJournalEntry({ content: editorContent })
    }

    setView('list')
    setCurrentEntry(null)
    setEditorContent('')
  }

  const handleDeleteEntry = (id) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      deleteJournalEntry(id)
    }
  }

  const filteredEntries = journalEntries.filter((entry) =>
    entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getPreview = (content) => {
    return content.substring(0, 150) + (content.length > 150 ? '...' : '')
  }

  const getWordCount = (content) => {
    return content.trim().split(/\s+/).length
  }

  if (view === 'editor') {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h2 className="text-3xl font-bold">
            {currentEntry ? 'Edit Entry' : 'New Entry'} 📝
          </h2>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
          {currentEntry && (
            <p className="text-sm text-slate-400 mb-4">
              Created: {formatDateTime(currentEntry.createdAt)}
              {currentEntry.updatedAt && ` • Last updated: ${formatDateTime(currentEntry.updatedAt)}`}
            </p>
          )}

          <textarea
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            placeholder="Write your thoughts, feelings, or reflections here... (Markdown supported)"
            className="w-full bg-slate-700 text-white px-4 py-4 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
            rows="15"
          />

          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-slate-400">
              {getWordCount(editorContent)} words
            </p>
            <div className="space-x-3">
              <button
                onClick={() => setView('list')}
                className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEntry}
                className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded transition"
              >
                {currentEntry ? 'Update Entry' : 'Save Entry'}
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            💡 Tip: You can use Markdown for formatting (bold, italic, lists, etc.)
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Private Journal 📔</h2>
        <button
          onClick={handleNewEntry}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition"
        >
          New Entry
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search entries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-800 text-white px-4 py-2 rounded border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm mb-2">Total Entries</p>
          <p className="text-3xl font-bold">{journalEntries.length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm mb-2">Total Words</p>
          <p className="text-3xl font-bold">
            {journalEntries.reduce((sum, e) => sum + getWordCount(e.content), 0)}
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm mb-2">Average Length</p>
          <p className="text-3xl font-bold">
            {journalEntries.length > 0
              ? Math.round(
                  journalEntries.reduce((sum, e) => sum + getWordCount(e.content), 0) /
                    journalEntries.length
                )
              : 0}
          </p>
        </div>
      </div>

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center text-slate-400">
          <p>
            {journalEntries.length === 0
              ? 'No entries yet. Start journaling to reflect on your thoughts! 🌟'
              : 'No entries match your search.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((entry) => (
              <div
                key={entry.id}
                className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1" onClick={() => handleEditEntry(entry)}>
                    <p className="text-sm text-slate-400 mb-2">
                      {formatDateTime(entry.createdAt)}
                      {entry.updatedAt && ' • Edited'}
                    </p>
                    <p className="text-slate-300 line-clamp-2">{getPreview(entry.content)}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="ml-4 text-slate-400 hover:text-red-400 transition flex-shrink-0"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>{getWordCount(entry.content)} words</span>
                  <button
                    onClick={() => handleEditEntry(entry)}
                    className="text-purple-400 hover:text-purple-300 transition"
                  >
                    View & Edit →
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
