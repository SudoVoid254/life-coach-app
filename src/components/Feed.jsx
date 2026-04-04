import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '../store/appStore'
import { Plus, Trash2, ExternalLink, Clock, Bell, BellOff, RefreshCw, Home, Maximize2 } from 'lucide-react'

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
  const [iframeUrl, setIframeUrl] = useState(null)
  const [iframeError, setIframeError] = useState(false)
  
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
  const [isPageVisible, setIsPageVisible] = useState(true)

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('feedTimeLimit', timeLimit.toString())
  }, [timeLimit])

  // Track page visibility (pause timer when tab is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(document.visibilityState === 'visible')
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
    setIframeUrl(item.url)
    setIframeError(false)
  }

  const handleRefresh = () => {
    if (selectedSource) {
      setIframeUrl(null)
      setTimeout(() => setIframeUrl(selectedSource.url), 100)
    }
  }

  const handleOpenExternal = () => {
    if (selectedSource) {
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
            <strong>⚠️ Note:</strong> Some sites block embedding (Instagram, Twitter, Facebook, etc.). 
            They'll open in a new tab instead. Sites like blogs, news, and documentation usually work great.
          </div>
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
                    <button
                      key={item.id}
                      onClick={() => handleSelectSource(item)}
                      className={`w-full text-left p-3 rounded transition ${
                        selectedSource?.id === item.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                      }`}
                    >
                      <p className="font-medium text-sm truncate">{item.title}</p>
                      <p className="text-xs opacity-70 truncate">{getDomain(item.url)}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Embedded Content Area */}
        <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex flex-col">
          {!selectedSource ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Home size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a source to start browsing</p>
                <p className="text-sm mt-2">Or add a new one above</p>
              </div>
            </div>
          ) : iframeError ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center max-w-md">
                <p className="text-lg mb-4">⚠️ This site can't be embedded</p>
                <p className="text-sm mb-4">
                  {selectedSource.title} blocks embedding in iframes for security reasons.
                </p>
                <button
                  onClick={handleOpenExternal}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition mx-auto"
                >
                  <ExternalLink size={18} />
                  Open in New Tab
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Browser Toolbar */}
              <div className="bg-slate-900 border-b border-slate-700 p-2 flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                  title="Refresh"
                >
                  <RefreshCw size={18} />
                </button>
                <div className="flex-1 bg-slate-800 rounded px-3 py-1.5 text-sm text-slate-300 truncate">
                  {selectedSource.title}
                </div>
                <button
                  onClick={handleOpenExternal}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                  title="Open in new tab"
                >
                  <ExternalLink size={18} />
                </button>
              </div>
              
              {/* Iframe */}
              <div className="flex-1 relative bg-white">
                {iframeUrl && (
                  <iframe
                    key={iframeUrl}
                    src={iframeUrl}
                    className="w-full h-full border-0"
                    title={selectedSource.title}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    onError={handleIframeError}
                  />
                )}
              </div>
            </>
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
