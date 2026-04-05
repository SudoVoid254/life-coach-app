import React, { useMemo } from 'react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function HabitAnalytics({ completions, frequency }) {
  const chartData = useMemo(() => {
    if (!completions || completions.length === 0) return null

    if (frequency === 'daily') {
      // Hours of the day pattern
      const hours = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        count: 0
      }))
      completions.forEach(c => {
        const hour = new Date(c).getHours()
        hours[hour].count++
      })
      return { type: 'hours', data: hours, title: 'Peak Completion Hours' }
    } else if (frequency === 'weekly') {
      // Best days of the week pattern
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const counts = new Array(7).fill(0)
      completions.forEach(c => {
        counts[new Date(c).getDay()]++
      })
      const data = days.map((day, i) => ({ day, count: counts[i] }))
      return { type: 'days', data, title: 'Best Days of the Week' }
    } else {
      // Monthly: Distribution by month of the year
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ]
      const counts = new Array(12).fill(0)
      completions.forEach(c => {
        counts[new Date(c).getMonth()]++
      })
      const data = months.map((month, i) => ({ month, count: counts[i] }))
      return { type: 'months', data, title: 'Monthly Consistency' }
    }
  }, [completions, frequency])

  if (!chartData) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-700/30 rounded-lg text-slate-500 italic">
        Not enough data to generate analytics
      </div>
    )
  }

  return (
    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
      <h4 className="text-sm font-semibold text-slate-400 mb-4">{chartData.title}</h4>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis
              dataKey={chartData.type === 'hours' ? 'hour' : chartData.type === 'days' ? 'day' : 'month'}
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
  )
}
