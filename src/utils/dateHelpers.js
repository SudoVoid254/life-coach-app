// Format date to YYYY-MM-DD
export function formatDate(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
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

// Check if two dates are on the same local calendar day
export function isSameDay(date1, date2) {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
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

  // Normalize completions to unique local date strings (YYYY-MM-DD)
  const dateSet = new Set(
    completions.map((c) => formatDate(c))
  )

  const todayStr = formatDate(new Date())
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = formatDate(yesterday)

  let streak = 0
  let checkDate = new Date()

  // If not completed today, check if completed yesterday to maintain streak
  if (!dateSet.has(todayStr)) {
    if (!dateSet.has(yesterdayStr)) {
      return 0
    }
    // Start counting from yesterday
    checkDate.setDate(checkDate.getDate() - 1)
  }

  // Count backwards
  while (true) {
    if (dateSet.has(formatDate(checkDate))) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
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
