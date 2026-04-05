import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function HabitAnalytics({ completions, frequency }) {
  const chartData = useMemo(() => {
    if (!completions || completions.length === 0) return { trend: [], pattern: [] }

    // 1. Trend Data (Completion rate over time)
    const trend = []
    const today = new Date()
    const periods = frequency === 'daily' ? 30 : frequency === 'weekly' ? 12 : 12
    const unit = frequency === 'daily' ? 'day' : frequency === 'weekly' ? 'week' : 'month'

    for (let i = periods - 1; i >= 0; i--) {
      const d = new Date(today)
      if (unit === 'day') d.setDate(d.getDate() - i)
      else if (unit === 'week') d.setDate(d.getDate() - i * 7)
      else d.setMonth(d.getMonth() - i)

      const dateStr = d.toISOString().split('T')[0]
      const isCompleted = completions.some(c => {
        const compDate = new Date(c)
        if (frequency === 'daily') {
          return compDate.toISOString().split('T')[0] === dateStr
        } else if (frequency === 'weekly') {
          // Check if completion falls in the same week as d
          const weekStart = new Date(d)
          weekStart.setDate(weekStart.getDate() - weekStart.getDay())
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekEnd.getDate() + 6)
          return compDate >= weekStart && compDate <= weekEnd
        } else {
          // Check if completion falls in same month/year
          return compDate.getFullYear() === d.getFullYear() && compDate.getMonth() === d.getMonth()
        }
      })

      trend.push({
        name: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        completed: isCompleted ? 1 : 0
      })
    }

    // 2. Pattern Data (Day of week)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const counts = new Array(7).fill(0)
    completions.forEach(c => {
      counts[new Date(c).getDay()]++
    })
    const pattern = days.map((day, i) => ({ day, count: counts[i] }))

    return { trend, pattern }
  }, [completions, frequency])

  if (completions.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-700/30 rounded-lg text-slate-500 italic">
        Not enough data to generate analytics
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
        <h4 className="text-sm font-semibold text-slate-400 mb-4">Completion Trend</h4>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                ticks={[0, 1]}
                tickFormatter={(val) => val === 1 ? '✓' : '✗'}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}
                itemStyle={{ color: '#a855f7' }}
              />
              <Line
                type="stepAfter"
                dataKey="completed"
                stroke="#a855f7"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
        <h4 className="text-sm font-semibold text-slate-400 mb-4">Best Days to Complete</h4>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.pattern}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}
                itemStyle={{ color: '#a855f7' }}
              />
              <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
