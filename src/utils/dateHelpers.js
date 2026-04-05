// Format date to YYYY-MM-DD
export function formatDate(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Format date with time
export function formatDateTime(date) {
  return new Date(date).toLocaleString()
}

// Format date to a human-friendly string (e.g., "April 5, 2026 • 12:20 PM")
export function formatFriendlyDate(date) {
  const d = new Date(date)
  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' }
  const timeOptions = { hour: '2-digit', minute: '2-digit' }

  const datePart = d.toLocaleDateString(undefined, dateOptions)
  const timePart = d.toLocaleTimeString(undefined, timeOptions)

  return `${datePart} • ${timePart}`
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

// Get streak count for habits based on frequency
export function getStreak(completions, frequency = 'daily') {
  if (!completions || completions.length === 0) return 0

  const dateSet = new Set(completions.map((c) => formatDate(c)))
  const today = new Date()

  if (frequency === 'daily') {
    const todayStr = formatDate(today)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = formatDate(yesterday)

    let streak = 0
    let checkDate = new Date(today)

    if (!dateSet.has(todayStr)) {
      if (!dateSet.has(yesterdayStr)) return 0
      checkDate.setDate(checkDate.getDate() - 1)
    }

    while (true) {
      if (dateSet.has(formatDate(checkDate))) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
    return streak
  } else if (frequency === 'weekly') {
    // Get ISO week number for a date
    const getWeek = (date) => {
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() + 4 - (d.getDay() || 7))
      const yearStart = new Date(d.getFullYear(), 0, 1)
      return Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
    }

    const getYearWeek = (date) => {
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() + 4 - (d.getDay() || 7))
      const year = d.getFullYear()
      const week = getWeek(d)
      return `${year}-W${week}`
    }

    const weekSet = new Set(completions.map(c => getYearWeek(c)))
    const currentWeek = getYearWeek(today)

    let streak = 0
    let checkDate = new Date(today)

    // Helper to get previous week's key
    const getPrevWeekKey = (date) => {
      const d = new Date(date)
      d.setDate(d.getDate() - 7)
      return getYearWeek(d)
    }

    if (!weekSet.has(currentWeek)) {
      if (!weekSet.has(getPrevWeekKey(today))) return 0
      checkDate.setDate(checkDate.getDate() - 7)
    }

    while (true) {
      const key = getYearWeek(checkDate)
      if (weekSet.has(key)) {
        streak++
        checkDate.setDate(checkDate.getDate() - 7)
      } else {
        break
      }
    }
    return streak
  } else if (frequency === 'monthly') {
    const getMonthKey = (date) => {
      const d = new Date(date)
      return `${d.getFullYear()}-${d.getMonth()}`
    }

    const monthSet = new Set(completions.map(c => getMonthKey(c)))
    const currentMonth = getMonthKey(today)

    let streak = 0
    let checkDate = new Date(today)

    const getPrevMonthKey = (date) => {
      const d = new Date(date)
      d.setMonth(d.getMonth() - 1)
      return getMonthKey(d)
    }

    if (!monthSet.has(currentMonth)) {
      if (!monthSet.has(getPrevMonthKey(today))) return 0
      checkDate.setMonth(checkDate.getMonth() - 1)
    }

    while (true) {
      if (monthSet.has(getMonthKey(checkDate))) {
        streak++
        checkDate.setMonth(checkDate.getMonth() - 1)
      } else {
        break
      }
    }
    return streak
  }

  return 0
}

// Get completion rate for habits based on frequency
export function getCompletionRate(habit) {
  const completions = habit.completions || []
  if (completions.length === 0) return 0
  const frequency = habit.frequency || 'daily'

  const createdDate = new Date(habit.createdAt)
  createdDate.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (frequency === 'daily') {
    const uniqueDays = new Set(completions.map(c => formatDate(c))).size
    const totalDays = Math.floor((today - createdDate) / 86400000) + 1
    return Math.min(Math.round((uniqueDays / totalDays) * 100), 100)
  } else if (frequency === 'weekly') {
    const getYearWeek = (date) => {
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() + 4 - (d.getDay() || 7))
      const year = d.getFullYear()
      const week = Math.ceil(((d - new Date(year, 0, 1)) / 86400000 + 1) / 7)
      return `${year}-W${week}`
    }
    const uniqueWeeks = new Set(completions.map(c => getYearWeek(c))).size
    const totalWeeks = Math.floor(daysBetween(createdDate, today) / 7) + 1
    return Math.min(Math.round((uniqueWeeks / totalWeeks) * 100), 100)
  } else if (frequency === 'monthly') {
    const getMonthKey = (date) => {
      const d = new Date(date)
      return `${d.getFullYear()}-${d.getMonth()}`
    }
    const uniqueMonths = new Set(completions.map(c => getMonthKey(c))).size
    const totalMonths = (today.getFullYear() - createdDate.getFullYear()) * 12 + (today.getMonth() - createdDate.getMonth()) + 1
    return Math.min(Math.round((uniqueMonths / totalMonths) * 100), 100)
  }

  return 0
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
