import { autoSchedule } from '../../scheduler/schedule-v3'
import { useCalendarsEventsValue } from '../../context'

export const AutoScheduleButton = () => {
  const { calendarsEvents } = useCalendarsEventsValue()

  return (
    <div>
      <button onClick={() => autoSchedule(calendarsEvents)}>
        Auto Schedule
      </button>
    </div>
  )
}
