// returns the dayId for the day difference from today
export const getDayId = (dayDiff) => {
  const date = new Date()
  date.setDate(date.getDate() + dayDiff)
  return `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`
}

// returns the day difference from today for a given dayId
export const getDayDiff = (dayId) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const day = new Date(dayId)
  return Math.floor((day - today) / (1000 * 60 * 60 * 24))
}

// returns the day of the week for a given dayId
export const getDayOfWeek = (dayId) => {
  const day = new Date(dayId)
  return day.toLocaleString('en-US', { weekday: 'short' })
}

// returns the formatted date from a given dayId
export const formatDate = (date) => {
  const day = new Date(date)
  return day.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// returns the day from a given dayId
export const getDay = (dayId) => {
  const day = new Date(dayId)
  return day.getDate()
}
