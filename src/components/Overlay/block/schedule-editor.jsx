export const ScheduleEditor = ({ schedule, setSchedule }) => {
  return (
    <input
      type='date'
      value={schedule}
      onChange={(e) => setSchedule(e.target.value)}
    />
  )
}
