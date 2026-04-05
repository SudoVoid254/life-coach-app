import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '../store/appStore'
import { Plus, Trash2, ExternalLink, Clock, Bell, BellOff, Home } from 'lucide-react'

export default function Feed() {
  const { feedItems, addFeedItem, deleteFeedItem } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    source: '',
    notes: '',
  })
  const [selectedSource, setSelectedSource] = useState(null)

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
  const [isPageVisible, setIsPageVisible] = useState(true)

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('feedTimeLimit', timeLimit.toString())
  }, [timeLimit])

  // Track page visibility and session time
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible'
      setIsPageVisible(visible)

      if (visible) {
        const startTime = localStorage.getItem('sessionStartTime')
        if (startTime) {
          const now = Date.now()
          const deltaMs = now - parseInt(startTime, 10)
          const deltaMin = Math.floor(deltaMs / 1000 / 60)

          if (deltaMin > 0) {
            setTodayUsage(prev => {
              const newValue = prev + deltaMin
              localStorage.setItem('feedUsage', newValue.toString())
              localStorage.setItem('feedUsageDate', new Date().toDateString())
              return newValue
            })
          }
          localStorage.removeItem('sessionStartTime')
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Track time spent viewing feed content
  useEffect(() => {
    // Reset usage if it's a new day
    const today = new Date().toDateString()
    const savedDate = localStorage.getItem('feedUsageDate')
    if (savedDate !== today) {
      setTodayUsage(0)
      localStorage.setItem('feedUsageDate', today)
    }

    // Start tracking session time (only when actively viewing)
    sessionTimerRef.current = setInterval(() => {
      if (!isPageVisible || !selectedSource) {
        lastSaveRef.current = Date.now()
        return
      }
      
      const now = Date.now()
      const elapsed = Math.floor((now - lastSaveRef.current) / 1000) // seconds
      
      if (elapsed >= 10) { // Update every 10 seconds
        const minutesToAdd = Math.floor(elapsed / 60)
        if (minutesToAdd > 0) {
          setTodayUsage(prev => {
            const newValue = prev + minutesToAdd
            localStorage.setItem('feedUsage', newValue.toString())
            localStorage.setItem('feedUsageDate', today)
            return newValue
          })
          lastSaveRef.current = now
        }
      }
    }, 10000)

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current)
      }
    }
  }, [isPageVisible, selectedSource])

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
    if (selectedSource?.id === id) {
      setSelectedSource(null)
      setIframeUrl(null)
    }
  }

  const handleSelectSource = (item) => {
    setSelectedSource(item)
  }

  const handleRefresh = () => {
    if (selectedSource) {
      setIframeUrl(null)
      setIframeError(false)
      setTimeout(() => setIframeUrl(selectedSource.url), 100)
    }
  }

  // Detect when iframe fails to load (timeout if content doesn't appear)
  useEffect(() => {
    if (iframeUrl && !iframeError) {
      const timeout = setTimeout(() => {
        setIframeError(true)
      }, 4000) // 4 second timeout

      return () => clearTimeout(timeout)
    }
  }, [iframeUrl, iframeError])

  const handleOpenExternal = () => {
    if (selectedSource) {
      localStorage.setItem('sessionStartTime', Date.now().toString())
      window.open(selectedSource.url, '_blank', 'noopener,noreferrer')
    }
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

  const handleIframeError = () => {
    setIframeError(true)
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-200px)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
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
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mb-4 flex items-center gap-3">
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

      {/* Time Limit Status */}
      <div className={`rounded-lg p-3 border mb-4 ${
        isTimeUp() 
          ? 'bg-red-900/30 border-red-700' 
          : todayUsage > timeLimit * 0.7 
            ? 'bg-yellow-900/30 border-yellow-700'
            : 'bg-slate-800 border-slate-700'
      }`}>
        <div className="flex items-center gap-3">
          <Clock size={18} className={isTimeUp() ? 'text-red-400' : 'text-slate-400'} />
          <div className="flex-1">
            <p className={`text-sm font-semibold ${isTimeUp() ? 'text-red-400' : 'text-slate-200'}`}>
              {isTimeUp() 
                ? "⏰ Daily limit reached!" 
                : `${todayUsage}/${timeLimit} min`}
            </p>
          </div>
          <button
            onClick={() => setBreakRemindersEnabled(!breakRemindersEnabled)}
            className="text-slate-400 hover:text-white"
            title={breakRemindersEnabled ? 'Disable break reminders' : 'Enable break reminders'}
          >
            {breakRemindersEnabled ? <Bell size={16} /> : <BellOff size={16} />}
          </button>
          <input
            type="number"
            min="5"
            max="120"
            value={timeLimit}
            onChange={(e) => setTimeLimit(parseInt(e.target.value) || 30)}
            className="bg-slate-700 text-white px-2 py-1 rounded w-16 text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
            title="Daily time limit in minutes"
          />
        </div>
      </div>

      {/* Add Source Form */}
      {showForm && (
        <form
          onSubmit={handleAddItem}
          className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-4"
        >
          <div className="bg-yellow-900/30 border border-yellow-700 rounded p-3 mb-4 text-sm text-yellow-300">
            <strong>⚠️ Note:</strong> This app is a mindful launchpad. Sources will open in a new tab to preserve your privacy and avoid embedding restrictions.
          </div>
          <input
            type="text"
            placeholder="Title (e.g., 'BBC News')"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-slate-700 text-white px-4 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="url"
            placeholder="URL (e.g., 'https://bbc.com')"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="w-full bg-slate-700 text-white px-4 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="text"
            placeholder="Source name (optional, e.g., 'News')"
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

      {/* Main Content Area */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Source List Sidebar */}
        <div className="w-64 flex-shrink-0 flex flex-col">
          <div className="bg-slate-800 rounded-lg border border-slate-700 flex-1 overflow-hidden flex flex-col">
            <div className="p-3 border-b border-slate-700">
              <h3 className="font-semibold text-sm text-slate-300">Your Sources</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {feedItems.length === 0 ? (
                <div className="text-center text-slate-400 text-sm py-8">
                  <p>No sources yet</p>
                  <p className="text-xs mt-1">Add your favorite sites</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {feedItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <button
                        onClick={() => handleSelectSource(item)}
                        className={`flex-1 text-left p-3 rounded transition ${
                          selectedSource?.id === item.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                        }`}
                      >
                        <p className="font-medium text-sm truncate">{item.title}</p>
                        <p className="text-xs opacity-70 truncate">{getDomain(item.url)}</p>
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded"
                        title="Remove source"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Source Profile Area */}
        <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex flex-col">
          {!selectedSource ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Home size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a source to start browsing</p>
                <p className="text-sm mt-2">Or add a new one above</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-lg w-full bg-slate-900/50 rounded-2xl border border-slate-700 p-8 text-center shadow-xl">
                <div className="mb-6">
                  <span className="px-3 py-1 rounded-full bg-purple-900/50 text-purple-400 text-xs font-medium border border-purple-700/50 uppercase tracking-wider">
                    {getDomain(selectedSource.url)}
                  </span>
                  <h3 className="text-4xl font-bold mt-4 mb-2">{selectedSource.title}</h3>
                  <p className="text-slate-400 italic">"Intentional Browsing"</p>
                </div>

                <div className="bg-slate-800/80 rounded-xl p-6 mb-8 border border-slate-700 text-left">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2 tracking-widest">Your Intention</p>
                  <p className="text-slate-200 leading-relaxed">
                    {selectedSource.notes || "No specific notes for this source. Visit with curiosity and intention."}
                  </p>
                </div>

                <button
                  onClick={handleOpenExternal}
                  className="group w-full flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 font-bold text-lg"
                >
                  Enter Site
                  <ExternalLink size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-xs text-slate-500 mt-4">
                  The site will open in a new tab. Your time will be tracked when you return.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Usage Controls */}
      <div className="mt-4 bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={breakRemindersEnabled}
              onChange={(e) => setBreakRemindersEnabled(e.target.checked)}
              className="rounded bg-slate-700 border-slate-600 text-purple-600 focus:ring-purple-500"
            />
            <span>Break reminders at 80%</span>
          </div>
          <button
            onClick={resetUsage}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            Reset Counter
          </button>
        </div>
      </div>
    </div>
  )
}
