import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Trash2 } from 'lucide-react'
import { formatDate } from '../utils/dateHelpers'

export default function MoodLogger() {
  const { moods, addMood, deleteMood } = useAppStore()
  const [selectedMood, setSelectedMood] = useState(5)
  const [notes, setNotes] = useState('')

  const moodEmojis = {
    1: '😢',
    2: '😞',
    3: '😐',
    4: '🙂',
    5: '😊',
    6: '😄',
    7: '😍',
    8: '🤩',
    9: '🎉',
    10: '🚀',
  }

  const handleAddMood = () => {
    addMood({
      mood: selectedMood,
      notes: notes,
    })
    setSelectedMood(5)
    setNotes('')
  }

  // Get mood data for chart (last 30 days)
  const getChartData = () => {
    const last30Days = {}
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = formatDate(date)
      last30Days[dateStr] = []
    }

    moods.forEach((mood) => {
      const dateStr = formatDate(mood.timestamp)
      if (last30Days[dateStr]) {
        last30Days[dateStr].push(mood.mood)
      }
    })

    return Object.entries(last30Days).map(([date, moodValues]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: moodValues.length > 0 ? Math.round(moodValues.reduce((a, b) => a + b) / moodValues.length) : null,
    }))
  }

  const getTodayMood = () => {
    const today = formatDate(new Date())
    return moods.filter((m) => formatDate(m.timestamp) === today)
  }

  const getTrendText = () => {
    if (moods.length < 2) return 'Start logging to see trends'
    const recent = moods.slice(-7)
    const recentAvg = recent.reduce((a, b) => a + b.mood, 0) / recent.length
    const older = moods.slice(-14, -7)
    const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b.mood, 0) / older.length : recentAvg

    if (recentAvg > olderAvg + 0.5) return '📈 Your mood is improving!'
    if (recentAvg < olderAvg - 0.5) return '📉 Your mood has dipped recently'
    return '➡️ Your mood is stable'
  }

  const chartData = getChartData()
  const todayMoods = getTodayMood()
  const averageMood = moods.length > 0 ? (moods.reduce((a, b) => a + b.mood, 0) / moods.length).toFixed(1) : 0

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Mood Logger 😊</h2>

      {/* Quick Log */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
        <h3 className="text-xl font-semibold mb-4">How are you feeling today?</h3>

        {/* Mood Slider */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-4xl">{moodEmojis[selectedMood]}</span>
            <span className="text-2xl font-bold text-purple-400">{selectedMood}/10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={selectedMood}
            onChange={(e) => setSelectedMood(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>Terrible</span>
            <span>Neutral</span>
            <span>Excellent</span>
          </div>
        </div>

        {/* Notes */}
        <textarea
          placeholder="Add optional notes (what made you feel this way?)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-slate-700 text-white px-4 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows="3"
        />

        <button
          onClick={handleAddMood}
          className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition font-semibold"
        >
          Log Mood
        </button>
      </div>

      {/* Today's Entries */}
      {todayMoods.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
          <h3 className="text-lg font-semibold mb-4">Today's Mood Entries ({todayMoods.length})</h3>
          <div className="space-y-2">
            {todayMoods.map((mood) => (
              <div
                key={mood.id}
                className="flex items-center justify-between bg-slate-700 p-3 rounded"
              >
                <div>
                  <span className="text-2xl mr-3">{moodEmojis[mood.mood]}</span>
                  <span className="font-semibold">{mood.mood}/10</span>
                  {mood.notes && <p className="text-sm text-slate-400 mt-1">{mood.notes}</p>}
                </div>
                <button
                  onClick={() => deleteMood(mood.id)}
                  className="text-slate-400 hover:text-red-400 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm mb-2">Average Mood</p>
          <p className="text-3xl font-bold">{averageMood}</p>
          <p className="text-xs text-slate-400 mt-1">{moodEmojis[Math.round(averageMood)]}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm mb-2">Total Entries</p>
          <p className="text-3xl font-bold">{moods.length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm mb-2">Trend</p>
          <p className="text-sm font-semibold">{getTrendText()}</p>
        </div>
      </div>

      {/* Chart */}
      {moods.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold mb-4">Mood Trend (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
              <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis domain={[0, 10]} stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={{ fill: '#7c3aed', r: 4 }}
                activeDot={{ r: 6 }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {moods.length === 0 && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center text-slate-400">
          <p>No mood entries yet. Start logging to see your trends! 📊</p>
        </div>
      )}
    </div>
  )
}
