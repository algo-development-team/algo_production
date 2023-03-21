import TimePicker from 'react-time-picker'

export const MyTimePicker = ({ time, setTime }) => {
  const roundTimeToNearest15Minutes = (time) => {
    const quarterHour = 15 * 60 * 1000
    const roundedTime = new Date(
      Math.round(time.getTime() / quarterHour) * quarterHour,
    )

    return roundedTime
  }

  return (
    <TimePicker
      onChange={(newTime) => {
        if (!newTime) return
        const newTimeObj = new Date(`2023-01-01T${newTime}`) // 2023-01-01 is a placeholder date
        const newHours = newTimeObj.getHours()
        const newMinutes = newTimeObj.getMinutes()
        const updatedTime = new Date(time)
        updatedTime.setHours(newHours)
        updatedTime.setMinutes(newMinutes)
        setTime(updatedTime)
      }}
      onBlur={() => {
        setTime(roundTimeToNearest15Minutes(time))
      }}
      value={time}
      disableClock={true}
      format='hh:mm a'
      step={900}
      use12Hours={true}
    />
  )
}
