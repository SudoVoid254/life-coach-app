import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { Plus, Trash2, ExternalLink, Clock } from 'lucide-react'

export default function Feed() {
  const { feedItems, addFeedItem, deleteFeedItem } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    source: '',
    notes: '',
  })
  const [timeLimit, setTimeLimit] = useState(30) // minutes per day
  const [todayUsage, setTodayUsage] = useState(0)

  const handleAddItem = (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.url.trim()) return

    addFeedItem({
      title: formData.title,
      url: formData.url,
      source: formData.source || 'Manual',
      notes: formData.notes,
      addedAt: new Date().toISOString(),
    })

    setFormData({ title: '', url: '', source: '', notes: '' })
    setShowForm(false)
  }

  const handleDeleteItem = (id) => {
    deleteFeedItem(id)
  }

  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  const getTimeRemaining = () => {
    const remaining = Math.max(0, timeLimit - todayUsage)
    return remaining
  }

  const isTimeUp = () => {
    return todayUsage >= timeLimit
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Curated Feed 📰</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          Add Source
        </button>
      </div>

      {/* Time Limit Warning */}
      <div className={`rounded-lg p-4 border mb-6 ${
        isTimeUp() 
          ? 'bg-red-900/30 border-red-700' 
          : todayUsage > timeLimit * 0.7 
            ? 'bg-yellow-900/30 border-yellow-700'
            : 'bg-slate-800 border-slate-700'
      }`}>
        <div className="flex items-center gap-3">
          <Clock size={20} className={isTimeUp() ? 'text-red-400' : 'text-slate-400'} />
          <div className="flex-1">
            <p className={`font-semibold ${isTimeUp() ? 'text-red-400' : 'text-slate-200'}`}>
              {isTimeUp() 
                ? "⏰ You've reached your daily time limit!" 
                : `Today's usage: ${todayUsage}/${timeLimit} minutes`}
            </p>
            {!isTimeUp() && (
              <p className="text-sm text-slate-400">
                {getTimeRemaining()} minutes remaining
              </p>
            )}
          </div>
          <input
            type="number"
            min="5"
            max="120"
            value={timeLimit}
            onChange={(e) => setTimeLimit(parseInt(e.target.value) || 30)}
            className="bg-slate-700 text-white px-3 py-1 rounded w-20 text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Add Source Form */}
      {showForm && (
        <form
          onSubmit={handleAddItem}
          className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6"
        >
          <input
            type="text"
            placeholder="Title (e.g., 'Wait But Why')"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-slate-700 text-white px-4 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="url"
            placeholder="URL (e.g., 'https://waitbutwhy.com')"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="w-full bg-slate-700 text-white px-4 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="text"
            placeholder="Source name (optional, e.g., 'Blog')"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className="w-full bg-slate-700 text-white px-4 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <textarea
            placeholder="Why do you like this? (optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full bg-slate-700 text-white px-4 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows="2"
          />
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition"
            >
              Add Source
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Feed Items */}
      {feedItems.length === 0 ? (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center text-slate-400">
          <p>No sources yet. Add your favorite creators, blogs, or newsletters! 🌟</p>
          <p className="text-sm mt-2">
            This is an algorithm-free zone — you choose what to see.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedItems
            .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
            .map((item) => (
              <div
                key={item.id}
                className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl font-semibold text-purple-400 hover:text-purple-300 transition flex items-center gap-2"
                    >
                      {item.title}
                      <ExternalLink size={16} />
                    </a>
                    <p className="text-sm text-slate-400 mt-1">
                      {getDomain(item.url)}
                      {item.source && ` • ${item.source}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-slate-400 hover:text-red-400 transition ml-4"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                
                {item.notes && (
                  <p className="text-slate-300 text-sm italic">"{item.notes}"</p>
                )}
                
                <p className="text-xs text-slate-500 mt-3">
                  Added {new Date(item.addedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-slate-800 rounded-lg p-6 border border-slate-700 text-slate-400 text-sm">
        <p className="mb-2">
          <strong>💡 How it works:</strong> This is your personal, algorithm-free content feed.
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-500">
          <li>Add blogs, newsletters, YouTube channels, or any creators you value</li>
          <li>No algorithms deciding what you see — you're in control</li>
          <li>Set daily time limits to prevent doom scrolling</li>
          <li>Coming soon: Aggregate new content from your sources in one place</li>
        </ul>
      </div>
    </div>
  )
}
