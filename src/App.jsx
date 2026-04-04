import { useState } from 'react'
import { useAppStore } from './store/appStore'
import Dashboard from './components/Dashboard'
import HabitTracker from './components/HabitTracker'
import MoodLogger from './components/MoodLogger'
import Journal from './components/Journal'
import Feed from './components/Feed'
import Settings from './components/Settings'
import { Home, Zap, Smile, BookOpen, Rss, Settings as SettingsIcon } from 'lucide-react'

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  const pages = {
    dashboard: { label: 'Dashboard', icon: Home, component: Dashboard },
    habits: { label: 'Habits', icon: Zap, component: HabitTracker },
    mood: { label: 'Mood', icon: Smile, component: MoodLogger },
    journal: { label: 'Journal', icon: BookOpen, component: Journal },
    feed: { label: 'Feed', icon: Rss, component: Feed },
    settings: { label: 'Settings', icon: SettingsIcon, component: Settings },
  }

  const CurrentPage = pages[currentPage].component

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 shadow-lg">
        <h1 className="text-2xl font-bold text-center">🌟 Life Coach</h1>
        <p className="text-slate-400 text-sm text-center">Your privacy-first companion</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <CurrentPage />
      </main>

      {/* Navigation Bar */}
      <nav className="bg-slate-900 border-t border-slate-800 sticky bottom-0">
        <div className="flex justify-around gap-2 p-3">
          {Object.entries(pages).map(([key, { label, icon: Icon }]) => (
            <button
              key={key}
              onClick={() => setCurrentPage(key)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition ${
                currentPage === key
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={label}
            >
              <Icon size={20} />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
