// Format date to YYYY-MM-DD
export function formatDate(date) {
  return new Date(date).toISOString().split('T')[0]
}

// Format date with time
export function formatDateTime(date) {
  return new Date(date).toLocaleString()
}

// Get start of day
export function getStartOfDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// Get end of day
export function getEndOfDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

// Get days between two dates
export function daysBetween(date1, date2) {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2 - d1)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Get streak count for habits
export function getStreak(completions) {
  if (!completions || completions.length === 0) return 0

  const sorted = [...completions].sort((a, b) => new Date(b) - new Date(a))
  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  for (const completion of sorted) {
    const compDate = new Date(completion)
    compDate.setHours(0, 0, 0, 0)

    if (currentDate - compDate === 0) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else if (currentDate - compDate === 86400000) {
      // 24 hours in ms
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

// Get week number
export function getWeekNumber(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const weekNum = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
  return weekNum
}
