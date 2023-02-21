// write a function that takes a numeric value representing the day difference from today, and returns the dayId in the format 'MM-DD-YYYY'
export const getDayId = (dayDiff) => {
  const date = new Date()
  date.setDate(date.getDate() + dayDiff)
  return `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`
}
