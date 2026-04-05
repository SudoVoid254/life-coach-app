import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { Trash2, Plus, Check, Info, Edit } from 'lucide-react'
import { getStreak, formatDate, formatDateTime, isSameDay } from '../utils/dateHelpers'

export default function HabitTracker() {
  const { habits, addHabit, updateHabit, deleteHabit } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [selectedHabitId, setSelectedHabitId] = useState(null)
  const [editingHabitId, setEditingHabitId] = useState(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    color: 'purple',
  })
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
    const completions = habit.completions || []

    const isCompletedToday = completions.some(c => isSameDay(new Date(c), new Date()))

    const newCompletions = isCompletedToday
      ? completions.filter(c => !isSameDay(new Date(c), new Date()))
      : [...completions, new Date().toISOString()]

    updateHabit(habitId, { completions: newCompletions })
  }

  const getCompletionRate = (habit) => {
    const completions = habit.completions || []
    if (completions.length === 0) return 0

    const uniqueCompletions = [...new Set(completions.filter(c => c))]

    // Normalize dates to midnight for accurate day calculation
    const createdDate = new Date(habit.createdAt)
    createdDate.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const diffTime = today.getTime() - createdDate.getTime()
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1

    const validCompletions = uniqueCompletions.filter(completion => {
      const compDate = new Date(completion)
      compDate.setHours(0, 0, 0, 0)
      return compDate >= createdDate && compDate <= today
    })

    const rate = Math.round((validCompletions.length / totalDays) * 100)
    return Math.min(rate, 100)
  }

  const isCompletedToday = (habit) => {
    return (habit.completions || []).some(c => isSameDay(new Date(c), new Date()))
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
            if (editingHabitId === habit.id) {
              return (
                <div key={habit.id} className="bg-slate-800 rounded-lg p-6 border border-blue-500 shadow-lg transition">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-blue-400">Edit Habit</h3>
                    <button
                      onClick={() => setEditingHabitId(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Habit name"
                    />
                    <textarea
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Description"
                      rows="2"
                    />
                    <div className="flex gap-4">
                      <select
                        value={editFormData.frequency}
                        onChange={(e) => setEditFormData({ ...editFormData, frequency: e.target.value })}
                        className="flex-1 bg-slate-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                      <select
                        value={editFormData.color}
                        onChange={(e) => setEditFormData({ ...editFormData, color: e.target.value })}
                        className="flex-1 bg-slate-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Object.keys(colors).map((c) => (
                          <option key={c} value={c}>
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-4 pt-2">
                      <button
                        onClick={() => {
                          updateHabit(habit.id, editFormData)
                          setEditingHabitId(null)
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition font-semibold"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingHabitId(null)}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )
            }

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
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingHabitId(habit.id)
                        setEditFormData({
                          name: habit.name,
                          description: habit.description,
                          frequency: habit.frequency,
                          color: habit.color,
                        })
                      }}
                      className="p-2 text-slate-400 hover:text-blue-400 transition"
                      title="Edit Habit"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => setSelectedHabitId(habit.id)}
                      className="p-2 text-slate-400 hover:text-purple-400 transition"
                      title="View Details"
                    >
                      <Info size={20} />
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-2 text-slate-400 hover:text-red-400 transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
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

      {selectedHabitId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Habit Details</h3>
              <button
                onClick={() => setSelectedHabitId(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {(() => {
              const habit = habits.find(h => h.id === selectedHabitId)
              if (!habit) return null

              return (
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Habit Name</p>
                    <p className="text-lg font-semibold">{habit.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400 mb-1">Created At</p>
                    <p className="text-lg">{formatDateTime(habit.createdAt)}</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400 mb-2">Completion History</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {(habit.completions || []).length === 0 ? (
                        <p className="text-slate-500 italic text-sm">No completions yet</p>
                      ) : (
                        [...(habit.completions || [])]
                          .sort((a, b) => new Date(b) - new Date(a))
                          .map((date, idx) => (
                            <div key={idx} className="flex justify-between bg-slate-700/50 p-2 rounded text-sm">
                              <span>{date}</span>
                              <span className="text-slate-400">{formatDateTime(date).split(', ')[1] || ''}</span>
                            </div>
                          ))
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedHabitId(null)}
                    className="w-full bg-slate-700 hover:bg-slate-600 py-2 rounded-lg transition"
                  >
                    Close
                  </button>
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
