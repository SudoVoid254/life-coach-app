import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '../store/appStore'
import { Plus, Trash2, ExternalLink, Clock, Bell, BellOff } from 'lucide-react'

export default function Feed() {
  const { feedItems, addFeedItem, deleteFeedItem } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    source: '',
    notes: '',
  })
  
  // Time tracking state
  const [timeLimit, setTimeLimit] = useState(() => {
    const saved = localStorage.getItem('feedTimeLimit')
    return saved ? parseInt(saved) : 30
  })
  const [todayUsage, setTodayUsage] = useState(() => {
    const saved = localStorage.getItem('feedUsage')
    const savedDate = localStorage.getItem('feedUsageDate')
    const today = new Date().toDateString()
    
    if (saved && savedDate === today) {
      return parseInt(saved)
    }
    return 0
  })
  const [showBreakReminder, setShowBreakReminder] = useState(false)
  const [breakRemindersEnabled, setBreakRemindersEnabled] = useState(true)
  const sessionTimerRef = useRef(null)
  const lastSaveRef = useRef(Date.now())

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('feedTimeLimit', timeLimit.toString())
  }, [timeLimit])

  // Track time spent on feed page
  useEffect(() => {
    // Reset usage if it's a new day
    const today = new Date().toDateString()
    const savedDate = localStorage.getItem('feedUsageDate')
    if (savedDate !== today) {
      setTodayUsage(0)
      localStorage.setItem('feedUsageDate', today)
    }

    // Start tracking session time
    sessionTimerRef.current = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.floor((now - lastSaveRef.current) / 1000) // seconds
      
      if (elapsed >= 10) { // Update every 10 seconds
        setTodayUsage(prev => {
          const newValue = prev + Math.floor(elapsed / 60)
          localStorage.setItem('feedUsage', newValue.toString())
          localStorage.setItem('feedUsageDate', today)
          return newValue
        })
        lastSaveRef.current = now
      }
    }, 10000)

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current)
      }
    }
  }, [])

  // Show break reminder when approaching limit
  useEffect(() => {
    if (!breakRemindersEnabled) return
    
    const warningThreshold = timeLimit * 0.8 // 80% of limit
    if (todayUsage >= warningThreshold && todayUsage < timeLimit) {
      setShowBreakReminder(true)
    } else {
      setShowBreakReminder(false)
    }
  }, [todayUsage, timeLimit, breakRemindersEnabled])

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

  const resetUsage = () => {
    if (confirm('Reset today\'s usage counter?')) {
      setTodayUsage(0)
      localStorage.setItem('feedUsage', '0')
    }
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

      {/* Break Reminder Alert */}
      {showBreakReminder && (
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mb-6 flex items-center gap-3">
          <Bell size={20} className="text-yellow-400" />
          <div className="flex-1">
            <p className="text-yellow-400 font-semibold">
              ⏰ Time for a break? You've used {todayUsage}/{timeLimit} minutes today.
            </p>
            <p className="text-sm text-yellow-300/70">
              Consider stepping away from the screen for a few minutes.
            </p>
          </div>
          <button
            onClick={() => setShowBreakReminder(false)}
            className="text-yellow-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBreakRemindersEnabled(!breakRemindersEnabled)}
              className="text-slate-400 hover:text-white"
              title={breakRemindersEnabled ? 'Disable break reminders' : 'Enable break reminders'}
            >
              {breakRemindersEnabled ? <Bell size={18} /> : <BellOff size={18} />}
            </button>
            <input
              type="number"
              min="5"
              max="120"
              value={timeLimit}
              onChange={(e) => setTimeLimit(parseInt(e.target.value) || 30)}
              className="bg-slate-700 text-white px-3 py-1 rounded w-20 text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
              title="Daily time limit in minutes"
            />
          </div>
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

      {/* Usage Controls */}
      <div className="mt-6 bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Usage Controls</h3>
          <button
            onClick={resetUsage}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            Reset Today's Counter
          </button>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <input
            type="checkbox"
            checked={breakRemindersEnabled}
            onChange={(e) => setBreakRemindersEnabled(e.target.checked)}
            className="rounded bg-slate-700 border-slate-600 text-purple-600 focus:ring-purple-500"
          />
          <span>Enable break reminders at 80% of time limit</span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 bg-slate-800 rounded-lg p-6 border border-slate-700 text-slate-400 text-sm">
        <p className="mb-2">
          <strong>💡 How it works:</strong> This is your personal, algorithm-free content feed.
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-500">
          <li>Add blogs, newsletters, YouTube channels, or any creators you value</li>
          <li>No algorithms deciding what you see — you're in control</li>
          <li>Time tracking runs while you're on this page</li>
          <li>Break reminders help you develop healthy browsing habits</li>
          <li>All usage data stored locally in your browser</li>
        </ul>
      </div>
    </div>
  )
}
