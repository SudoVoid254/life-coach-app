import { useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { formatDate } from '../utils/dateHelpers'

export default function Dashboard() {
  const initialize = useAppStore((state) => state.initialize)
  const habits = useAppStore((state) => state.habits)
  const moods = useAppStore((state) => state.moods)
  const journalEntries = useAppStore((state) => state.journalEntries)

  useEffect(() => {
    initialize()
  }, [initialize])

  const today = formatDate(new Date())
  const todayHabits = habits.filter((h) => (h.completions || []).includes(today)).length
  const todayMood = moods.find((m) => formatDate(m.timestamp) === today)

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Welcome Back! 👋</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Habits Card */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold mb-2">Today's Habits</h3>
          <p className="text-4xl font-bold text-purple-400 mb-2">{todayHabits}/{habits.length}</p>
          <p className="text-slate-400">completed</p>
        </div>

        {/* Mood Card */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold mb-2">Current Mood</h3>
          <p className="text-4xl font-bold text-pink-400 mb-2">{todayMood?.mood || '-'}/10</p>
          <p className="text-slate-400">{todayMood ? 'today' : 'no mood logged'}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
        <div className="text-slate-300 space-y-2">
          <p>📝 Total journal entries: {journalEntries.length}</p>
          <p>🎯 Total habits: {habits.length}</p>
          <p>🔐 All data encrypted locally</p>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 bg-slate-800 rounded-lg p-6 border border-slate-700 text-slate-300">
        <p className="text-sm">
          💡 <strong>Tip:</strong> Use the navigation at the bottom to explore habits, moods, journal, and more.
        </p>
      </div>
    </div>
  )
}