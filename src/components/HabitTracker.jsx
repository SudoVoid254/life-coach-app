import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { Trash2, Plus, Check } from 'lucide-react'
import { getStreak, formatDate } from '../utils/dateHelpers'

export default function HabitTracker() {
  const { habits, addHabit, updateHabit, deleteHabit } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    color: 'purple',
  })

  const colors = {
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    pink: 'bg-pink-500',
    yellow: 'bg-yellow-500',
  }

  const handleAddHabit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    addHabit({
      name: formData.name,
      description: formData.description,
      frequency: formData.frequency,
      color: formData.color,
      completions: [],
    })

    setFormData({ name: '', description: '', frequency: 'daily', color: 'purple' })
    setShowForm(false)
  }

  const toggleCompletion = (habitId) => {
    const habit = habits.find((h) => h.id === habitId)
    const today = formatDate(new Date())
    const completions = habit.completions || []
    const isCompletedToday = completions.includes(today)

    const newCompletions = isCompletedToday
      ? completions.filter((c) => c !== today)
      : [...completions, today]

    updateHabit(habitId, { completions: newCompletions })
  }

  const getCompletionRate = (habit) => {
    const completions = habit.completions || []
    if (completions.length === 0) return 0
    const daysSinceCreated = Math.max(
      0,
      Math.floor((new Date() - new Date(habit.createdAt)) / (1000 * 60 * 60 * 24)) + 1
    )
    const rate = Math.round((completions.length / (daysSinceCreated + 1)) * 100)
    return Math.min(rate, 100) // Cap at 100%
  }

  const isCompletedToday = (habit) => {
    const today = formatDate(new Date())
    return (habit.completions || []).includes(today)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Habit Tracker 🎯</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          New Habit
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddHabit}
          className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6"
        >
          <input
            type="text"
            placeholder="Habit name (e.g., Morning Jog)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-slate-700 text-white px-4 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-slate-700 text-white px-4 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows="2"
          />
          <div className="flex gap-4 mb-4">
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="flex-1 bg-slate-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <select
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="flex-1 bg-slate-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {Object.keys(colors).map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition"
            >
              Add Habit
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

      {habits.length === 0 ? (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center text-slate-400">
          <p>No habits yet. Create one to get started! 🚀</p>
        </div>
      ) : (
        <div className="space-y-4">
          {habits.map((habit) => {
            const completed = isCompletedToday(habit)
            const streak = getStreak(habit.completions || [])
            const rate = getCompletionRate(habit)

            return (
              <div
                key={habit.id}
                className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{habit.name}</h3>
                    {habit.description && (
                      <p className="text-sm text-slate-400">{habit.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="text-slate-400 hover:text-red-400 transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={() => toggleCompletion(habit.id)}
                    className={`flex items-center justify-center w-16 h-16 rounded-lg transition ${
                      completed
                        ? `${colors[habit.color]} text-white`
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    {completed && <Check size={28} />}
                    {!completed && <span className="text-sm">Today?</span>}
                  </button>

                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-400">Completion Rate</span>
                      <span className="font-semibold">{rate}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${colors[habit.color]} transition`}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-700 rounded p-3">
                    <p className="text-slate-400">Streak</p>
                    <p className="text-2xl font-bold">{streak}</p>
                  </div>
                  <div className="bg-slate-700 rounded p-3">
                    <p className="text-slate-400">Total Completions</p>
                    <p className="text-2xl font-bold">{(habit.completions || []).length}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
